import { exportWordTemplate } from "../utils/ExportWordTemplate";

export function exportWord(divisions = []) {
  if (!divisions || divisions.length === 0) return;

  const columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Name", key: "name", width: 25 },
    { header: "Location", key: "location", width: 18 },
    { header: "Type", key: "type", width: 10 },
    { header: "Status", key: "status", width: 12 },
    { header: "Latitude", key: "latitude", width: 14 },
    { header: "Longitude", key: "longitude", width: 14 },
    { header: "Radius", key: "radius", width: 10 },
    { header: "Start Time", key: "startTime", width: 12 },
    { header: "End Time", key: "endTime", width: 12 },
    { header: "Created At", key: "createdAt", width: 16 },
  ];

  const data = divisions.map((d) => ({
    name: d.name,
    location: d.location,
    type: d.type,
    status: d.status,
    latitude: d.latitude,
    longitude: d.longitude,
    radius: d.radius,
    startTime: d.startTime,
    endTime: d.endTime,
    createdAt: new Date(d.createdAt).toLocaleDateString("id-ID"),
  }));

  exportWordTemplate({
    title: "Location Report",
    sheetName: "Locations",
    columns,
    data,
  });
}
