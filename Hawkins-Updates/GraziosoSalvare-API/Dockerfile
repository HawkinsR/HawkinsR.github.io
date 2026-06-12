FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["GraziosoSalvare.csproj", "./"]
RUN dotnet restore "GraziosoSalvare.csproj"

COPY . .
RUN dotnet build "GraziosoSalvare.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "GraziosoSalvare.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=publish /app/publish .

EXPOSE 8080
EXPOSE 8081

ENTRYPOINT ["dotnet", "GraziosoSalvare.dll"]
