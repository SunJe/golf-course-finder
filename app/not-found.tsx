import Link from "next/link";
import { MapPinOff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <MapPinOff className="h-8 w-8" />
      </span>
      <h1 className="text-2xl font-bold text-gray-900">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="max-w-sm text-sm text-gray-500">
        요청하신 골프장 정보가 없거나 주소가 변경되었을 수 있습니다.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        전국 골프장 보러가기
      </Link>
    </div>
  );
}
