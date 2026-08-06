"use client";

import { useState } from "react";
import { Bot, Send } from "lucide-react";
import { InsightCard, PageHeader, StatusBadge } from "@/components/demo-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LocalizedLink as Link, useI18n } from "@/i18n/provider";
import type { CopilotAnswer, CopilotData } from "@/lib/copilot/service";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  data?: Record<string, string | number>;
  evidence?: string[];
  students?: { id: string; name: string }[];
};

export function CopilotPage({ data, firstName }: { data: CopilotData; firstName: string }) {
  const { t } = useI18n();
  const welcome = `Hello {name}. I can summarise visible school data, prepare a weekly review, or explain why a student appears in an attention group. I will always show the evidence behind suggestions.`;
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", text: welcome, data: { name: firstName } }]);
  const [input, setInput] = useState("");

  const render = (text: string, data: Record<string, string | number> = {}) => {
    let out = t(text);
    for (const [key, value] of Object.entries(data)) {
      const resolved = typeof value === "string" ? t(value) : String(value);
      out = out.split(`{${key}}`).join(resolved);
    }
    return out;
  };

  const scopeContext = render("Context: {scope}", { scope: data.scopeLabel });

  const ask = (raw: string) => {
    const prompt = raw.trim();
    if (!prompt) return;
    const needle = prompt.toLowerCase();
    const answer: CopilotAnswer | null =
      data.answers.find((a) => a.prompt.toLowerCase() === needle || t(a.prompt).toLowerCase() === needle) ?? null;
    const next: ChatMessage[] = [...messages, { role: "user", text: prompt }];
    if (answer) {
      next.push({
        role: "assistant",
        text: render(answer.text, answer.data),
        evidence: answer.evidence,
        students: answer.students,
      });
    } else {
      next.push({
        role: "assistant",
        text: t("I can only answer grounded questions about the visible data. Try one of the suggested prompts."),
      });
    }
    setMessages(next);
    setInput("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Copilot")}
        description={t("Authorised summaries and suggestions grounded in visible data. Teacher judgement remains essential.")}
        actions={<StatusBadge tone="info">{t("Deterministic answers")}</StatusBadge>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-50 p-3 text-violet-600 dark:bg-violet-500/10"><Bot className="h-5 w-5" /></div>
              <div><h2 className="font-bold">{t("Suggested prompts")}</h2><p className="text-xs text-slate-500">{t("Try a grounded question")}</p></div>
            </div>
            <div className="mt-4 space-y-2">
              {data.answers.map((answer) => (
                <button key={answer.prompt} onClick={() => ask(answer.prompt)} className="w-full rounded-xl border border-slate-100 p-3 text-left text-sm font-medium transition hover:border-primary-300 hover:bg-primary-50/50 dark:border-slate-800 dark:hover:bg-primary-500/5">
                  {t(answer.prompt)}
                </button>
              ))}
            </div>
          </Card>
          <InsightCard
            positive
            title={t("Copilot guardrails")}
            reasons={[
              "No medical or psychological diagnosis",
              "No automatic punishment or irreversible decision",
              "Every recommendation must be linked to visible evidence",
            ]}
          />
        </div>
        <Card className="flex min-h-[640px] flex-col overflow-hidden">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <div className="font-bold">{t("New conversation")}</div>
            <div className="text-xs text-slate-500">{scopeContext}</div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-6 ${message.role === "user" ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>
                  {render(message.text, message.data)}
                  {message.students?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.students.map((student) => (
                        <Link key={student.id} href={`/students/${student.id}`} className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-inset ring-primary-200 hover:bg-primary-50 dark:bg-slate-900 dark:text-primary-300 dark:ring-primary-500/30">
                          {student.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                  {message.role === "assistant" && message.evidence?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.evidence.map((badge) => <StatusBadge key={badge} tone="info">{badge}</StatusBadge>)}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); ask(input); }} className="flex gap-2 border-t border-slate-100 p-4 dark:border-slate-800">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-900"
              placeholder={t("Ask about a class, student trend or weekly review…")}
            />
            <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
