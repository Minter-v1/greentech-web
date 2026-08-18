"use client";

import { useState, useTransition } from "react";
import { CircleCheck, CircleAlert, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { checkInAction, checkOutAction, type CheckState } from "./actions";

// MARK: - 출퇴근 버튼

export function CheckButtons() {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<CheckState>({});

  const run = (action: () => Promise<CheckState>) => {
    startTransition(async () => setState(await action()));
  };

  return (
    <div className="flex items-center gap-sm">
      {pending ? (
        <Spinner size="sm" />
      ) : state.message ? (
        <span
          className={
            state.ok
              ? "flex items-center gap-xxs text-body-sm text-ink"
              : "flex items-center gap-xxs text-body-sm text-error-deep"
          }
        >
          {state.ok ? (
            <CircleCheck className="size-4 shrink-0" />
          ) : (
            <CircleAlert className="size-4 shrink-0" />
          )}
          {state.message}
        </span>
      ) : null}

      <Button disabled={pending} onClick={() => run(checkInAction)} className="gap-xxs">
        <LogIn className="size-4" />
        출근
      </Button>
      <Button
        variant="secondary"
        disabled={pending}
        onClick={() => run(checkOutAction)}
        className="gap-xxs"
      >
        <LogOut className="size-4" />
        퇴근
      </Button>
    </div>
  );
}
