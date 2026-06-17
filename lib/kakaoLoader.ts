/**
 * Kakao Maps JavaScript SDK 로더.
 * NEXT_PUBLIC_KAKAO_MAP_APP_KEY 가 설정되어 있으면 SDK를 1회만 주입한다.
 */

declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (cb: () => void) => void;
        [key: string]: unknown;
      };
    };
  }
}

let loaderPromise: Promise<NonNullable<Window["kakao"]>> | null = null;

export const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY ?? "";
export const isKakaoConfigured = KAKAO_APP_KEY.trim().length > 0;

const SCRIPT_ID = "kakao-maps-sdk";

export function loadKakaoMaps(): Promise<NonNullable<Window["kakao"]>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Kakao Maps는 브라우저에서만 로드됩니다."));
  }
  if (!isKakaoConfigured) {
    return Promise.reject(new Error("Kakao Map API 키가 설정되지 않았습니다."));
  }
  if (window.kakao?.maps) {
    return Promise.resolve(window.kakao);
  }
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    const onReady = () => {
      if (!window.kakao?.maps) {
        reject(new Error("Kakao Maps SDK 초기화 실패"));
        return;
      }
      window.kakao.maps.load(() => {
        if (window.kakao) resolve(window.kakao);
        else reject(new Error("Kakao Maps SDK 초기화 실패"));
      });
    };

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", onReady);
      existing.addEventListener("error", () =>
        reject(new Error("Kakao Maps SDK 로드 실패")),
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`;
    script.addEventListener("load", onReady);
    script.addEventListener("error", () =>
      reject(new Error("Kakao Maps SDK 로드 실패")),
    );
    document.head.appendChild(script);
  });

  return loaderPromise;
}
