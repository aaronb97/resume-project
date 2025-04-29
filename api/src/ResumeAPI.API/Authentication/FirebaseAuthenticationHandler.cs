using System.Security.Claims;
using System.Text.Encodings.Web;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

public sealed class FirebaseAuthenticationHandler
    : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public FirebaseAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        ISystemClock clock
    )
        : base(options, logger, encoder, clock) { }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var header = Request.Headers.Authorization.ToString();

        if (
            string.IsNullOrEmpty(header)
            || !header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
        )
        {
            return AuthenticateResult.NoResult();
        }

        var token = header["Bearer ".Length..].Trim();

        try
        {
            var decoded = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);

            var claims = decoded
                .Claims.Select(kvp => new Claim(kvp.Key, kvp.Value?.ToString() ?? string.Empty))
                .ToList();

            claims.Add(new Claim(ClaimTypes.NameIdentifier, decoded.Uid));

            var identity = new ClaimsIdentity(claims, Scheme.Name);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);

            return AuthenticateResult.Success(ticket);
        }
        catch
        {
            return AuthenticateResult.Fail("Invalid Firebase token");
        }
    }
}
