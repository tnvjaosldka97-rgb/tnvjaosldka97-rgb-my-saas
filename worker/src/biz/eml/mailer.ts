import type { AppBindings } from '../../com/bindings'
import { sendViaResend } from './service'

const DEFAULT_FROM = '마케팅천재야 <noreply@mcy.co.kr>'

function isConfigured(env: AppBindings): boolean {
  return Boolean(env.RESEND_API_KEY) && env.RESEND_API_KEY !== 'replace-me'
}

/**
 * Resend 안전 발송 — API key 미설정 시 skip. 에러는 throw 안 함 (호출자 흐름 막지 않음)
 */
export async function sendEmailSafe(
  env: AppBindings,
  to: string,
  subject: string,
  html: string,
  text?: string,
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  if (!isConfigured(env)) {
    // 개발/초기 환경: Resend 미설정이면 로그만 남기고 성공 처리
    console.info('[mailer] RESEND_API_KEY not configured, skip send', { to, subject })
    return { ok: true, skipped: true }
  }
  if (!to || !to.includes('@')) {
    // 이메일 형식이 아니면 skip (SMS 경로는 추후)
    return { ok: true, skipped: true }
  }
  try {
    await sendViaResend(env.RESEND_API_KEY as string, {
      from: DEFAULT_FROM,
      to,
      subject,
      html,
      text,
    })
    return { ok: true }
  } catch (err) {
    console.error('[mailer] send failed', err)
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export function renderDraftApprovedEmail(name: string, projectId: number, projectTitle: string): { subject: string; html: string; text: string } {
  const subject = `[마케팅천재야] 접수하신 프로젝트가 공개되었습니다`
  const html = `<div style="font-family: -apple-system, Pretendard, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0B1E3F;">
    <h1 style="font-size: 20px; font-weight: 800; margin: 0 0 16px; color: #0B1E3F;">${name}님, 접수하신 프로젝트가 공개되었습니다 🎉</h1>
    <p style="font-size: 14px; line-height: 1.65; color: #475569;">
      운영팀 검토 후 "<strong>${projectTitle}</strong>" 프로젝트가 정식 공개되었습니다.
      검증 대행사들이 조건을 보고 견적을 제출할 예정입니다. 평균 첫 견적 도착 시간은 <strong>28시간</strong>입니다.
    </p>
    <p style="margin: 20px 0;">
      <a href="https://my-saas.com/project/${projectId}" style="display: inline-block; padding: 12px 22px; background: linear-gradient(135deg, #0B1E3F, #1D4ED8); color: white; border-radius: 8px; font-weight: 700; text-decoration: none;">프로젝트 보기 →</a>
    </p>
    <p style="font-size: 12.5px; color: #64748B; line-height: 1.6;">
      이 메일은 마케팅천재야(MCY) 플랫폼에서 발송되었습니다. 문의는 help@mcy.co.kr로 연락주세요.
    </p>
  </div>`
  const text = `${name}님, 접수하신 "${projectTitle}" 프로젝트가 공개되었습니다.\n검증 대행사들이 견적을 제출 중입니다.\n\nhttps://my-saas.com/project/${projectId}`
  return { subject, html, text }
}

export function renderDraftRejectedEmail(name: string, reason: string): { subject: string; html: string; text: string } {
  const subject = `[마케팅천재야] 프로젝트 접수 검토 결과 안내`
  const html = `<div style="font-family: -apple-system, Pretendard, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0B1E3F;">
    <h1 style="font-size: 20px; font-weight: 800; margin: 0 0 16px;">${name}님, 안타깝게 접수가 공개되지 못했습니다</h1>
    <p style="font-size: 14px; line-height: 1.65; color: #475569;">
      운영팀 검토 결과, 해당 프로젝트는 플랫폼 운영 기준에 부합하지 않아 공개되지 못했습니다.
    </p>
    <blockquote style="margin: 18px 0; padding: 14px 18px; background: #FEF2F2; border-left: 3px solid #DC2626; border-radius: 6px; color: #991B1B; font-size: 13px;">
      사유: ${reason}
    </blockquote>
    <p style="font-size: 14px; line-height: 1.65; color: #475569;">
      조건을 보완하여 다시 등록해주시거나, 문의 채널로 연락주시면 운영팀이 상세 안내해드립니다.
    </p>
    <p style="margin: 20px 0;">
      <a href="https://my-saas.com/#lead-start" style="display: inline-block; padding: 12px 22px; background: #1D4ED8; color: white; border-radius: 8px; font-weight: 700; text-decoration: none;">다시 등록하기</a>
    </p>
    <p style="font-size: 12.5px; color: #64748B;">문의: help@mcy.co.kr</p>
  </div>`
  const text = `${name}님, 접수 프로젝트가 공개되지 못했습니다.\n사유: ${reason}\n\n문의: help@mcy.co.kr`
  return { subject, html, text }
}
