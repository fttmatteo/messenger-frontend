# Agrega reglas de ProGuard específicas del proyecto aquí.
# Puedes controlar el conjunto de archivos de configuración aplicados usando la
# configuración proguardFiles en build.gradle.
#
# Para más detalles, consulta
#   http://developer.android.com/guide/developing/tools/proguard.html

# Si tu proyecto usa WebView con JS, descomenta lo siguiente
# y especifica el nombre de clase completamente calificado para la interfaz JavaScript
# class:
#-keepclassmembers class fqcn.de.la.interfaz.javascript.para.webview {
#   public *;
#}

# Descomenta esto para preservar la información de los números de línea para
# depurar trazas de errores (stack traces).
#-keepattributes SourceFile,LineNumberTable

# Si mantienes la información de los números de línea, descomenta esto para
# ocultar el nombre del archivo fuente original.
#-renamesourcefileattribute SourceFile
