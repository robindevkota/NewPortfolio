"use client";

import dynamic from "next/dynamic";

const WarpTunnel = dynamic(() => import("./WarpTunnel"), {
  ssr: false,
  loading: () => (
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(26,86,219,0.13) 0%, transparent 70%)"
    }} />
  ),
});

export default WarpTunnel;
