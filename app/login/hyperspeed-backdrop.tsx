"use client";

import dynamic from "next/dynamic";

// MARK: - Hyperspeed 배경 지연 로더
// three + postprocessing 청크가 폼 인터랙티브 시점을 막지 않도록 하이드레이션 이후 로드

const Hyperspeed = dynamic(() => import("@/components/Hyperspeed"), {
  ssr: false,
  loading: () => null,
});

// 인라인 객체로 넘기면 effectOptions 참조가 매 렌더 바뀌어 씬이 재생성됨
const BRAND_OPTIONS = {
  onSpeedUp: () => {},
  onSlowDown: () => {},
  distortion: "turbulentDistortion",
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [400 * 0.03, 400 * 0.2],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  // DESIGN.md 그라디언트 스톱 - 좌측은 preview 쌍(violet→pink), 우측은 develop 쌍(blue→cyan)
  colors: {
    roadColor: 0x0a0a0a,
    islandColor: 0x0e0e0e,
    background: 0x050505,
    shoulderLines: 0x131318,
    brokenLines: 0x131318,
    leftCars: [0x7928ca, 0xff0080, 0xeb367f],
    rightCars: [0x007cf0, 0x00dfd8, 0x50e3c2],
    sticks: 0x50e3c2,
  },
};

export function HyperspeedBackdrop() {
  return (
    <div className="absolute inset-0 animate-fade-in-slow">
      <Hyperspeed effectOptions={BRAND_OPTIONS} />
    </div>
  );
}
