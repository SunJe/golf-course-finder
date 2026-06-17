/**
 * NAVER Maps JavaScript API v3 로더.
 *
 * NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 가 설정되어 있으면 SDK 스크립트를 1회만 주입하고
 * window.naver.maps 가 준비된 Promise 를 반환한다.
 * 키가 없거나 로드에 실패하면 reject 되며, 호출부는 fallback 지도 UI 를 렌더한다.
 *
 * 참고: NAVER Cloud Platform 콘솔 마이그레이션에 따라 일부 계정은 스크립트 파라미터가
 *       `ncpClientId` 대신 `ncpKeyId` 일 수 있다. 그 경우 아래 SCRIPT_SRC 만 바꾸면 된다.
 */

declare global {
  interface Window {
    naver?: any;
  }
}

let loaderPromise: Promise<any> | null = null;

export const NAVER_CLIENT_ID =
  process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ?? "";
export const isNaverConfigured = NAVER_CLIENT_ID.trim().length > 0;

const SCRIPT_ID = "naver-maps-sdk";
const SCRIPT_SRC = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_CLIENT_ID}&submodules=geocoder`;

export function loadNaverMaps(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("NAVER Maps는 브라우저에서만 로드됩니다."));
  }
  if (!isNaverConfigured) {
    return Promise.reject(
      new Error("NAVER Maps API 클라이언트 ID가 설정되지 않았습니다."),
    );
  }
  if (window.naver?.maps) {
    return Promise.resolve(window.naver);
  }
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    const onReady = () => {
      if (window.naver?.maps) {
        resolve(window.naver);
      } else {
        reject(new Error("NAVER Maps SDK 초기화 실패"));
      }
    };

    const existing = document.getElementById(
      SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", onReady);
      existing.addEventListener("error", () =>
        reject(new Error("NAVER Maps SDK 로드 실패")),
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = SCRIPT_SRC;
    script.addEventListener("load", onReady);
    script.addEventListener("error", () =>
      reject(new Error("NAVER Maps SDK 로드 실패")),
    );
    document.head.appendChild(script);
  });

  return loaderPromise;
}
