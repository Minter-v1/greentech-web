"use client";

import { useState } from "react";
import { Building2, Leaf, Mail, MapPin, Phone, Rotate3D } from "lucide-react";
import { cn } from "@/lib/utils";

// MARK: - 전자 명함

interface DigitalBusinessCardProps {
  empNo: string;
  name: string;
  nameEn?: string;
  departmentName?: string;
  positionName?: string;
  email?: string;
  mobile?: string;
  tel?: string;
  address?: string;
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="grid grid-cols-[20px_52px_1fr] items-start gap-xs text-left">
      <span className="mt-xxs text-mute" aria-hidden>
        {icon}
      </span>
      <span className="text-caption uppercase tracking-[0.08em] text-mute">{label}</span>
      <span className="min-w-0 break-words text-body-sm text-ink">{value || "-"}</span>
    </div>
  );
}

export function DigitalBusinessCard({
  empNo,
  name,
  nameEn,
  departmentName,
  positionName,
  email,
  mobile,
  tel,
  address,
}: DigitalBusinessCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <section className="mt-lg rounded-lg bg-canvas px-md py-xl shadow-level-2 sm:px-xl">
      <div className="mx-auto flex max-w-[640px] flex-col items-center">
        <div className="mb-md flex w-full items-end justify-between gap-md">
          <div>
            <h2 className="text-display-sm">전자 명함</h2>
            <p className="mt-xxs text-caption text-mute">카드에 커서를 올리거나 눌러서 뒤집어 보세요</p>
          </div>
          <span className="hidden items-center gap-xxs text-caption font-medium uppercase tracking-[0.12em] text-mute sm:flex">
            <Rotate3D className="size-4" aria-hidden />
            360° view
          </span>
        </div>

        <button
          type="button"
          aria-label={`${name} 전자 명함 ${flipped ? "앞면 보기" : "연락처 보기"}`}
          aria-pressed={flipped}
          onClick={() => setFlipped((current) => !current)}
          className="group block aspect-[4/3] w-full cursor-pointer rounded-xl text-left focus-ring [perspective:1400px] sm:aspect-[1.75/1]"
        >
          <div
            className={cn(
              "relative block size-full rounded-xl transition-transform duration-700 ease-soft motion-reduce:transition-none [transform-style:preserve-3d]",
              flipped
                ? "[transform:rotateY(180deg)]"
                : "group-hover:[transform:rotateY(180deg)] group-focus-visible:[transform:rotateY(180deg)]",
            )}
          >
            <div className="absolute inset-0 flex flex-col overflow-hidden rounded-xl bg-primary p-lg text-on-primary shadow-level-5 [backface-visibility:hidden] sm:p-xl">
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-xs">
                  <span className="flex size-8 items-center justify-center rounded-sm bg-white/10 ring-1 ring-inset ring-white/20">
                    <Leaf className="size-4" aria-hidden />
                  </span>
                  <span className="text-body-sm font-medium tracking-[0.12em]">GREENTECH</span>
                </span>
                <span className="flex items-center gap-xxs text-caption uppercase tracking-[0.12em] text-white/55">
                  <Rotate3D className="size-3.5 transition-transform duration-700 group-hover:rotate-[360deg]" aria-hidden />
                  flip
                </span>
              </span>

              <span className="my-auto block">
                <span className="block text-display-md text-white sm:text-display-lg">{name}</span>
                <span className="mt-xxs block text-caption uppercase tracking-[0.16em] text-white/55">
                  {nameEn || "GREENTECH MEMBER"}
                </span>
                <span className="mt-sm block text-body-sm text-white/75">
                  {[departmentName, positionName].filter(Boolean).join(" · ") || "-"}
                </span>
              </span>

              <span className="flex items-end justify-between gap-md border-t border-white/15 pt-sm">
                <span>
                  <span className="block text-caption uppercase tracking-[0.12em] text-white/45">Employee No.</span>
                  <span className="mt-xxs block text-body-sm tabular-nums text-white/85">{empNo}</span>
                </span>
                <span className="max-w-[65%] truncate text-right text-caption text-white/55">{email || "-"}</span>
              </span>
            </div>

            <div className="absolute inset-0 flex flex-col overflow-hidden rounded-xl bg-canvas p-lg text-ink shadow-level-5 ring-1 ring-inset ring-hairline [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-xl">
              <span className="flex items-center justify-between border-b border-hairline pb-sm">
                <span className="flex items-center gap-xs">
                  <span className="flex size-8 items-center justify-center rounded-sm bg-primary text-on-primary">
                    <Leaf className="size-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-body-sm font-medium">{name}</span>
                    <span className="block text-caption text-mute">{positionName || "GREENTECH MEMBER"}</span>
                  </span>
                </span>
                <span className="text-caption uppercase tracking-[0.12em] text-mute">Contact</span>
              </span>

              <div className="my-auto grid gap-xs sm:gap-sm">
                <ContactRow icon={<Mail className="size-4" />} label="Mail" value={email} />
                <ContactRow icon={<Phone className="size-4" />} label="Mobile" value={mobile || tel} />
                <ContactRow icon={<Building2 className="size-4" />} label="Office" value={departmentName} />
                <ContactRow icon={<MapPin className="size-4" />} label="Address" value={address} />
              </div>

              <span className="border-t border-hairline pt-sm text-right text-caption uppercase tracking-[0.12em] text-mute">
                People Operations · Greentech
              </span>
            </div>
          </div>
        </button>
      </div>
    </section>
  );
}
