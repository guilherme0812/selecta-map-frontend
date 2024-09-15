"use client";

import Leaflet, {
  Map,
  GeoJSON as LeafletGeoJSON,
  Marker as LeafletMarker,
} from "leaflet";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import json from "./RISENET.json";

// Tipagens para os dados GeoJSON
interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point" | "LineString";
    coordinates: [number, number][] | [number, number];
  };
  properties: {
    Name: string;
  };
}

interface GeoJSONData {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { Feature, Geometry, Point } from "geojson";

Leaflet.Icon.Default.imagePath =
  "//cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/";

function MapComponent() {
  const [geojsonData, setGeojsonData] = useState(json);

  // Definindo ícones customizados
  const blueIcon = new Leaflet.Icon({
    iconUrl: "/icons/blue-icon.png", // Substitua pelo caminho do seu ícone
    iconSize: [36, 36],
    iconAnchor: [12, 36],
  });

  const redIcon = new Leaflet.Icon({
    iconUrl: "/icons/red-icon.png", // Substitua pelo caminho do seu ícone
    iconSize: [36, 36],
    iconAnchor: [12, 36],
  });

  // Função para definir estilo de linhas
  const lineStyle = {
    color: "blue", // Cor padrão das linhas
    weight: 4,
  };

  // Função para customizar ícones e estilos
  const onEachFeature = (
    feature: Feature<Geometry, any>,
    layer: Leaflet.Layer
  ) => {
    if (feature.geometry.type === "Point") {
      const icon = feature.properties.Name.includes("POP") ? blueIcon : redIcon;
      (layer as LeafletMarker<any>).setIcon(icon); // Define o ícone para o ponto
    }

    if (feature.geometry.type === "LineString") {
      (layer as LeafletGeoJSON).setStyle(lineStyle); // Define o estilo da linha
    }

    // Adiciona Popup a cada feature
    if (feature.properties && feature.properties.Name) {
      layer.bindPopup(feature.properties.Name);
    }
  };

  // Função para renderizar pontos com ícones personalizados
  const pointToLayer = (
    geoJsonPoint: Feature<Point, any>,
    latlng: Leaflet.LatLng
  ) => {
    const icon = geoJsonPoint.properties.Name.includes("POP")
      ? blueIcon
      : redIcon;
    return Leaflet.marker(latlng, { icon });
  };

  return (
    <div className="relative w-full h-screen">
      <div className="absolute z-10 h-full w-full bg-gray-300">
        <MapContainer
          center={[-14.1840979689955, -39.199390892743999]}
          zoom={14}
          // scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* {geojsonData.features.map((feature, index) => {
            if (feature.geometry.type === "Point") {
              const position = [
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0],
              ];

              // Definindo o ícone com base na propriedade
              const icon = feature.properties.Name.includes("POP")
                ? blueIcon
                : redIcon;

              return (
                <Marker key={index} position={position} icon={icon}>
                  <Popup>{feature.properties.Name}</Popup>
                </Marker>
              );
            } else if (feature.geometry.type === "LineString") {
              return (
                <Polyline
                  key={index}
                  positions={feature.geometry.coordinates.map(
                    (coord) => [coord[1], coord[0]] // Inverter as coordenadas para [lat, lng]
                  )}
                  color="blue" // Cor da linha
                  weight={4}
                >
                  <Popup>{feature.properties.Name}</Popup>
                </Polyline>
              );
            }
            return null;
          })} */}

          <GeoJSON
            data={geojsonData as any}
            onEachFeature={onEachFeature}
            pointToLayer={pointToLayer}
            style={lineStyle}
          />
        </MapContainer>
      </div>
    </div>
  );
}

function GeoJSONLayer({ data }: any) {
  const map = useMap();

  useEffect(() => {
    // Dados para autenticação na API Zabbix
    const loginData = {
      jsonrpc: "2.0",
      method: "user.login",
      params: {
        user: "api.maps.selecta",
        password: "S@imon0918",
      },
      id: 2,
    };

    // Realiza o login na API do Zabbix
    fetch("http://128.201.99.152:9971/zabbix/api_jsonrpc.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    })
      .then((response) => response.json())
      .then((result) => {
        const authToken = result.result;

        const data = {
          jsonrpc: "2.0",
          method: "item.get",
          params: {
            output: ["itemid", "name", "key_", "lastvalue"],
            hostids: "10562",
            search: {
              name: "Operational status",
            },
            sortfield: "name",
          },
          auth: authToken,
          id: 3,
        };

        // Faz a requisição para obter os itens
        fetch("http://128.201.99.152:9971/zabbix/api_jsonrpc.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then((response) => response.json())
          .then((result) => {
            const desiredItemIds = ["56767", "1564059"];

            const filteredItems = result.result.filter((item) =>
              desiredItemIds.includes(item.itemid)
            );

            filteredItems.forEach((item) => {
              const status = item.lastvalue;

              map.eachLayer((layer) => {
                if (layer.feature?.properties?.Name.includes(item.name)) {
                  if (status === "1") {
                    layer.setStyle({ color: "blue", weight: 4 });
                  } else if (status === "2") {
                    layer.setStyle({ color: "red", weight: 4 });
                  }
                }
              });
            });
          })
          .catch((error) => {
            console.error("Erro ao buscar itens:", error);
          });
      })
      .catch((error) => {
        console.error("Erro ao fazer login:", error);
      });
  }, [map, data]);

  return <GeoJSON data={data} style={{ color: "blue", weight: 4 }} />;
}

export default MapComponent;
