import PageHeader from '@/common/components/PageHeader'

const DefectManagementPage = () => {
  return (
    <div className="space-y-4">
      <PageHeader
        title="불량관리"
        description="검사와 생산 과정에서 발생한 불량, 원인, 조치 상태를 관리합니다."
      />
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-5 py-10 text-center text-sm text-[var(--text-muted)]">
        불량관리 화면을 준비 중입니다.
      </div>
    </div>
  )
}

export default DefectManagementPage
