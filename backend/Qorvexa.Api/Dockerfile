FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Qorvexa.Api.csproj ./
RUN dotnet restore Qorvexa.Api.csproj
COPY . ./
RUN dotnet publish Qorvexa.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
# Render/Netlify-style hosts terminate HTTPS at a proxy; trust X-Forwarded-* so HTTPS redirect works.
ENV ASPNETCORE_FORWARDEDHEADERS_ENABLED=true
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Qorvexa.Api.dll"]
