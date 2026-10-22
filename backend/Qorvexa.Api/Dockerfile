
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Qorvexa.Api.csproj ./
RUN dotnet restore Qorvexa.Api.csproj

COPY . ./
RUN dotnet publish Qorvexa.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000
ENTRYPOINT ["dotnet", "Qorvexa.Api.dll"]
