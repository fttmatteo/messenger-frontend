package com.plak.messenger;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

/**
 * BroadcastReceiver que reinicia el servicio de ubicación
 * después de reiniciar el dispositivo, solo si hay una sesión activa.
 */
public class BootReceiver extends BroadcastReceiver {

    private static final String TAG = "BootReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            return;
        }

        SharedPreferences prefs = context.getSharedPreferences(
                LocationForegroundService.PREFS_NAME, Context.MODE_PRIVATE);
        long messengerId = prefs.getLong("messengerId", -1);
        String authCookie = prefs.getString("authCookie", null);

        if (messengerId == -1 || authCookie == null) {
            Log.d(TAG, "No hay sesión activa, no se reinicia el servicio de ubicación");
            return;
        }

        Log.i(TAG, "Reiniciando servicio de ubicación para mensajero: " + messengerId);

        Intent serviceIntent = new Intent(context, LocationForegroundService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent);
        } else {
            context.startService(serviceIntent);
        }
    }
}
