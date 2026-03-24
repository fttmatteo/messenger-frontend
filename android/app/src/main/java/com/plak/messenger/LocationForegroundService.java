package com.plak.messenger;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.location.Location;
import android.os.Build;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Foreground Service que mantiene el tracking GPS activo incluso cuando
 * el usuario cierra la app de las aplicaciones recientes.
 *
 * Usa FusedLocationProviderClient para obtener ubicaciones de alta precisión
 * y las envía directamente al backend via HTTP nativo (sin depender del
 * WebView).
 *
 * Solo se detiene cuando el usuario cierra sesión explícitamente.
 */
public class LocationForegroundService extends Service {

    private static final String TAG = "LocationService";
    private static final String CHANNEL_ID = "plak_location_channel";
    private static final int NOTIFICATION_ID = 1001;
    public static final String PREFS_NAME = "PlakLocationPrefs";

    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    private ExecutorService httpExecutor;

    @Override
    public void onCreate() {
        super.onCreate();
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        httpExecutor = Executors.newSingleThreadExecutor();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForeground(NOTIFICATION_ID, buildNotification());
        startLocationUpdates();
        // START_STICKY: Android reiniciará el servicio si lo mata por falta de memoria
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (locationCallback != null) {
            fusedLocationClient.removeLocationUpdates(locationCallback);
        }
        if (httpExecutor != null) {
            httpExecutor.shutdown();
        }
        Log.i(TAG, "Servicio de ubicación detenido");
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Rastreo de ubicación",
                    NotificationManager.IMPORTANCE_LOW // Low = sin sonido, solo icono
            );
            channel.setDescription("Mantiene tu ubicación actualizada para la central.");
            channel.setShowBadge(false);

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private Notification buildNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        notificationIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);

        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, notificationIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("PLAK - Ubicación activa")
                .setContentText("Manteniendo tu ubicación actualizada para la central.")
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setSilent(true)
                .build();
    }

    private void startLocationUpdates() {
        LocationRequest locationRequest = new LocationRequest.Builder(
                Priority.PRIORITY_HIGH_ACCURACY, 10000 // 10 segundos
        )
                .setMinUpdateIntervalMillis(5000) // Mínimo 5 segundos
                .setMinUpdateDistanceMeters(5f) // Mínimo 5 metros de movimiento
                .build();

        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult locationResult) {
                if (locationResult == null)
                    return;

                for (Location location : locationResult.getLocations()) {
                    if (location.getAccuracy() > 50) {
                        Log.d(TAG, "Ignorando lectura imprecisa: " + location.getAccuracy() + "m");
                        continue;
                    }

                    sendLocationToServer(location);
                }
            }
        };

        try {
            fusedLocationClient.requestLocationUpdates(
                    locationRequest,
                    locationCallback,
                    Looper.getMainLooper());
            Log.i(TAG, "Tracking GPS iniciado");
        } catch (SecurityException e) {
            Log.e(TAG, "Permiso de ubicación no concedido", e);
            stopSelf();
        }
    }

    /**
     * Envía la ubicación al backend via HTTP POST nativo.
     * Se ejecuta en un thread separado para no bloquear el main thread.
     */
    private void sendLocationToServer(Location location) {
        httpExecutor.execute(() -> {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String backendUrl = prefs.getString("backendUrl", null);
            long messengerId = prefs.getLong("messengerId", -1);
            String authCookie = prefs.getString("authCookie", null);

            if (backendUrl == null || messengerId == -1 || authCookie == null) {
                Log.w(TAG, "Datos de sesión incompletos, deteniendo servicio");
                stopSelf();
                return;
            }

            HttpURLConnection conn = null;
            try {
                URL url = new URL(backendUrl + "/tracking/update");
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Authorization", authCookie);
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(10000);
                conn.setDoOutput(true);

                String json = String.format(java.util.Locale.US,
                        "{\"messengerId\":%d,\"latitude\":%.8f,\"longitude\":%.8f,\"speed\":%.2f,\"heading\":%.2f,\"accuracy\":%.2f,\"status\":\"ACTIVE\"}",
                        messengerId,
                        location.getLatitude(),
                        location.getLongitude(),
                        location.getSpeed(),
                        location.getBearing(),
                        location.getAccuracy());

                try (OutputStream os = conn.getOutputStream()) {
                    os.write(json.getBytes(StandardCharsets.UTF_8));
                }

                int responseCode = conn.getResponseCode();
                if (responseCode >= 200 && responseCode < 300) {
                    Log.d(TAG, String.format("Ubicación enviada: %.6f, %.6f (precision: %.1fm)",
                            location.getLatitude(), location.getLongitude(), location.getAccuracy()));
                } else {
                    Log.w(TAG, "Error del servidor: HTTP " + responseCode);
                }
            } catch (Exception e) {
                Log.e(TAG, "Error enviando ubicación: " + e.getMessage());
                // TODO: Implementar cola offline si es necesario
            } finally {
                if (conn != null) {
                    conn.disconnect();
                }
            }
        });
    }
}
