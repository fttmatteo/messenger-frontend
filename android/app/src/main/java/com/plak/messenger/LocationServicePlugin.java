package com.plak.messenger;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Plugin de Capacitor para gestionar el servicio de seguimiento de ubicación en
 * primer plano.
 * Permite iniciar un Foreground Service que persiste la ubicación del mensajero
 * incluso
 * cuando la aplicación está cerrada o en segundo plano.
 */
@CapacitorPlugin(name = "LocationService")
public class LocationServicePlugin extends Plugin {

    private static final String TAG = "LocationServicePlugin";

    @PluginMethod()
    public void startService(PluginCall call) {
        Double messengerIdDouble = call.getDouble("messengerId");
        String backendUrl = call.getString("backendUrl");
        String authCookie = call.getString("authCookie");

        if (messengerIdDouble == null || backendUrl == null || authCookie == null) {
            call.reject("Faltan parámetros: messengerId, backendUrl, authCookie");
            return;
        }

        long messengerId = messengerIdDouble.longValue();

        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(
                LocationForegroundService.PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
                .putLong("messengerId", messengerId)
                .putString("backendUrl", backendUrl)
                .putString("authCookie", authCookie)
                .apply();

        Intent serviceIntent = new Intent(context, LocationForegroundService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent);
        } else {
            context.startService(serviceIntent);
        }

        Log.i(TAG, "Servicio de ubicación iniciado para mensajero: " + messengerId);

        JSObject result = new JSObject();
        result.put("started", true);
        call.resolve(result);
    }

    @PluginMethod()
    public void stopService(PluginCall call) {
        Context context = getContext();

        Intent serviceIntent = new Intent(context, LocationForegroundService.class);
        context.stopService(serviceIntent);

        SharedPreferences prefs = context.getSharedPreferences(
                LocationForegroundService.PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().clear().apply();

        Log.i(TAG, "Servicio de ubicación detenido y sesión limpiada");

        JSObject result = new JSObject();
        result.put("stopped", true);
        call.resolve(result);
    }

}
