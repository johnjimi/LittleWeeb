using System;
using Android.App;
using Android.Content;
using Android.Runtime;
using Android.Views;
using Android.Webkit;
using Android.Widget;
using Android.OS;
using LilleWeebie.Views;
using LilleWeebie.Models;
using Android;
using Android.Content.PM;
using System.IO;
using System.Threading;
using LittleWeebLibrary;

namespace LilleWeebie
{
    [Activity(Label = "LilleWeebie", MainLauncher = true, ConfigurationChanges = Android.Content.PM.ConfigChanges.Orientation | Android.Content.PM.ConfigChanges.ScreenSize)]

    public class MainActivity : Activity
    {
        private LittleWeeb LittleWeeb = null;

        protected override void OnCreate(Bundle bundle)
        {
            base.OnCreate(bundle);
            RequestWindowFeature(WindowFeatures.NoTitle);
           
            if ((int)Build.VERSION.SdkInt >= 23)
            {
                if (PackageManager.CheckPermission(Manifest.Permission.ReadExternalStorage, PackageName) != Permission.Granted
                     && PackageManager.CheckPermission(Manifest.Permission.WriteExternalStorage, PackageName) != Permission.Granted)
                {
                    var permissions = new string[] { Manifest.Permission.ReadExternalStorage, Manifest.Permission.WriteExternalStorage };
                    RequestPermissions(permissions, 1);
                }
            }
            //run sunirc
            LittleWeeb = new LittleWeeb();



            // Set our view from the "main" layout resource
            SetContentView(Resource.Layout.Main);

            var webView = FindViewById<WebView>(Resource.Id.webView);
            webView.Settings.JavaScriptEnabled = true;
            webView.Settings.CacheMode = CacheModes.Normal;
            webView.Settings.DatabaseEnabled = true;
            webView.Settings.DomStorageEnabled = true;
            webView.Settings.AllowFileAccess = true;
            webView.Settings.AllowFileAccessFromFileURLs = true;
            webView.Settings.AllowUniversalAccessFromFileURLs = true;

            // Use subclassed WebViewClient to intercept hybrid native calls
            webView.SetWebChromeClient(new WebChromeClient());
            // Load the rendered HTML into the view with a base URL 
            // that points to the root of the bundled Assets folder
            webView.LoadUrl("file:///android_asset/index.html");

        }
        



    }
}

