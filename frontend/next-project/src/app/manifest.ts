import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nabad",
    short_name: "Nabad",
    description: "",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/icon192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}