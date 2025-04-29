using System.Text.Json.Serialization;
using Amazon;
using Amazon.S3;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using ResumeAPI;
using ResumeAPI.Endpoints;
using ResumeAPI.Models;
using ResumeAPI.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAWSService<IAmazonS3>();
builder.Services.Configure<S3Settings>(builder.Configuration.GetSection("S3Settings"));

builder.Services.AddSingleton<IAmazonS3>(sp =>
{
    var s3Settings = sp.GetRequiredService<IOptions<S3Settings>>().Value;
    var config = new AmazonS3Config()
    {
        RegionEndpoint = RegionEndpoint.GetBySystemName(s3Settings.Region),
    };

    return new AmazonS3Client(config);
});

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.Configure<Microsoft.AspNetCore.Mvc.JsonOptions>(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddSingleton<AiService>();

var connectionString = builder.Configuration.GetConnectionString("PostgresConnection");
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc(
            "v1",
            new OpenApiInfo
            {
                Title = "Todo API",
                Description = "Keep track of your tasks",
                Version = "v1",
            }
        );

        c.SupportNonNullableReferenceTypes();
    });
}

const string corsPolicy = "CorsPolicy";

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        corsPolicy,
        policy =>
        {
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        }
    );
});

builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = "Firebase";
        options.DefaultChallengeScheme = "Firebase";
    })
    .AddScheme<AuthenticationSchemeOptions, FirebaseAuthenticationHandler>("Firebase", _ => { });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Todo API V1");
    });
}

FirebaseApp.Create(
    new AppOptions()
    {
        Credential = GoogleCredential.FromJson(
            builder.Configuration["Firebase:ServiceAccountJson"]
        ),
    }
);

app.MapDocxUpload();
app.MapGet("/", () => "Hello World!");

app.UseCors(corsPolicy);

app.Run();
