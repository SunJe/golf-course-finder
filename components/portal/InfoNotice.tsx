export default function InfoNotice() {
  return (
    <section
      aria-label="서비스 안내"
      className="border-t border-stone-200/80 bg-stone-50/80"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="max-w-3xl text-sm leading-relaxed text-stone-600 sm:text-[15px]">
          GolfMap Korea의 골프장 정보는 공공데이터와 공식 출처를 기반으로
          정리하고 있습니다. 요금, 운영 정보, 예약 가능 여부는 변동될 수
          있으므로 방문 전 공식 홈페이지를 확인해 주세요.
        </p>
      </div>
    </section>
  );
}
