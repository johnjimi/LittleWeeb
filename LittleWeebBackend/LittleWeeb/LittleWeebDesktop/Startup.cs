using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ElectronNET.API;
using ElectronNET.API.Entities;
using LittleWeebLibrary;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LittleWeebDesktop
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });


            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/index.html");
            }
            
            app.Use(async (context, next) =>
            {
                await next();
                if (context.Response.StatusCode == 404)
                {
                    context.Request.Path = "/index.html";
                    await next();
                }
            });


            app.UseMvcWithDefaultRoute();
            app.UseDefaultFiles();
            app.UseStaticFiles();
            app.UseCookiePolicy();

            Bootstrap();
        }

        public async void Bootstrap()
        {

            LittleWeeb weeb = new LittleWeeb();

            var webPrefences = new WebPreferences()
            {
                NodeIntegration = false
            };
            var options = new BrowserWindowOptions
            {
                Show = false,
                Width = 1280,
                Height = 720,
                WebPreferences = webPrefences,
                Title = "LittleWeeb v0.4.0 - It Takes an Idiot to do something Cool",
                Icon = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "favicon.ico")
              

            };
            Debug.WriteLine(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "favicon.ico"));

            var mainWindow = await Electron.WindowManager.CreateWindowAsync(options);
            mainWindow.OnReadyToShow += () =>
            {
                mainWindow.Show();
            };

            mainWindow.OnClose += () =>
            {
                weeb.Stop();
            };

        }

    }
}
