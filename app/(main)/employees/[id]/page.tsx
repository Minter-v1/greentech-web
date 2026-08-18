import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { PageTransition } from "@/components/layout/page-transition";
import { EMPLOYMENT_TYPE_LABEL, EmployeeStatusBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardBody, CardHeader, EmptyState } from "@/components/ui/card";
import { Table, Td, Th, Thead, Tr } from "@/components/ui/table";
import { ApiError, orNull } from "@/lib/api/client";
import {
  getEmployee,
  getEmployeeContact,
  listCertificates,
  listEducations,
  listEmploymentHistories,
  listFamilyMembers,
} from "@/lib/api/employees";
import { formatDate } from "@/lib/utils";

// MARK: - 사원 상세

const DEGREE_LABEL: Record<string, string> = {
  HIGH_SCHOOL: "고졸",
  ASSOCIATE: "전문학사",
  BACHELOR: "학사",
  MASTER: "석사",
  DOCTOR: "박사",
};

const RELATION_LABEL: Record<string, string> = {
  SPOUSE: "배우자",
  CHILD: "자녀",
  PARENT: "부모",
  SIBLING: "형제자매",
  OTHER: "기타",
};

const CHANGE_TYPE_LABEL: Record<string, string> = {
  HIRE: "입사",
  PROMOTION: "승진",
  TRANSFER: "전보",
  LEAVE_OF_ABSENCE: "휴직",
  REINSTATE: "복직",
  RESIGN: "퇴사",
};

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-xxs">
      <span className="text-caption uppercase text-mute">{label}</span>
      <span className="text-body-sm">{value || "-"}</span>
    </div>
  );
}

export default async function EmployeeDetailPage({ params }: PageProps<"/employees/[id]">) {
  const { id } = await params;
  const employeeId = Number(id);
  if (!Number.isInteger(employeeId)) notFound();

  let employee;
  try {
    employee = await getEmployee(employeeId);
  } catch (error) {
    if (error instanceof ApiError) notFound();
    throw error;
  }

  const [contact, educations, certificates, familyMembers, histories] = await Promise.all([
    orNull(() => getEmployeeContact(employeeId)),
    listEducations(employeeId),
    listCertificates(employeeId),
    listFamilyMembers(employeeId),
    listEmploymentHistories(employeeId),
  ]);

  return (
    <PageTransition>
      <PageHeader
        eyebrow={employee.empNo}
        title={employee.name}
        description={[employee.departmentName, employee.positionName].filter(Boolean).join(" · ")}
        action={<LinkButton href="/employees">목록으로</LinkButton>}
      />

      <div className="grid gap-md xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="기본 정보" action={<EmployeeStatusBadge status={employee.status} />} />
          <CardBody className="grid grid-cols-2 gap-lg sm:grid-cols-3">
            <Row label="사번" value={employee.empNo} />
            <Row label="성명" value={employee.name} />
            <Row label="영문명" value={employee.nameEn} />
            <Row label="주민등록번호" value={employee.residentNoMasked} />
            <Row label="생년월일" value={formatDate(employee.birthDate)} />
            <Row label="이메일" value={employee.email} />
            <Row label="부서" value={employee.departmentName} />
            <Row label="직위" value={employee.positionName} />
            <Row label="고용형태" value={EMPLOYMENT_TYPE_LABEL[employee.employmentType]} />
            <Row label="입사일" value={formatDate(employee.hireDate)} />
            <Row label="퇴사일" value={employee.resignDate ? formatDate(employee.resignDate) : "-"} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="연락처" />
          <CardBody className="grid grid-cols-2 gap-lg">
            <Row label="휴대전화" value={contact?.mobile} />
            <Row label="유선전화" value={contact?.tel} />
            <Row
              label="주소"
              value={[contact?.address1, contact?.address2].filter(Boolean).join(" ")}
            />
            <Row label="우편번호" value={contact?.zipCode} />
            <Row label="비상연락처" value={contact?.emergencyName} />
            <Row label="비상연락 전화" value={contact?.emergencyPhone} />
          </CardBody>
        </Card>
      </div>

      <div className="mt-lg grid gap-md xl:grid-cols-2">
        <Card>
          <CardHeader title="학력" />
          {educations.length === 0 ? (
            <CardBody>
              <EmptyState message="등록된 학력이 없습니다" />
            </CardBody>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>학교</Th>
                  <Th>전공</Th>
                  <Th>학위</Th>
                  <Th>졸업일</Th>
                </tr>
              </Thead>
              <tbody>
                {educations.map((education) => (
                  <Tr key={education.id}>
                    <Td className="font-medium">{education.schoolName}</Td>
                    <Td className="text-body">{education.major ?? "-"}</Td>
                    <Td className="text-body">
                      {education.degree ? DEGREE_LABEL[education.degree] : "-"}
                    </Td>
                    <Td className="text-body">{formatDate(education.graduationDate)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader title="자격증" />
          {certificates.length === 0 ? (
            <CardBody>
              <EmptyState message="등록된 자격증이 없습니다" />
            </CardBody>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>자격증</Th>
                  <Th>발급기관</Th>
                  <Th>취득일</Th>
                  <Th>만료일</Th>
                </tr>
              </Thead>
              <tbody>
                {certificates.map((certificate) => (
                  <Tr key={certificate.id}>
                    <Td className="font-medium">{certificate.name}</Td>
                    <Td className="text-body">{certificate.issuer ?? "-"}</Td>
                    <Td className="text-body">{formatDate(certificate.acquiredDate)}</Td>
                    <Td className="text-body">{formatDate(certificate.expiryDate)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader title="가족사항" />
          {familyMembers.length === 0 ? (
            <CardBody>
              <EmptyState message="등록된 가족사항이 없습니다" />
            </CardBody>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>성명</Th>
                  <Th>관계</Th>
                  <Th>생년월일</Th>
                  <Th>부양</Th>
                </tr>
              </Thead>
              <tbody>
                {familyMembers.map((member) => (
                  <Tr key={member.id}>
                    <Td className="font-medium">{member.name}</Td>
                    <Td className="text-body">{RELATION_LABEL[member.relation] ?? member.relation}</Td>
                    <Td className="text-body">{formatDate(member.birthDate)}</Td>
                    <Td className="text-body">{member.dependent ? "예" : "아니오"}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader title="발령 이력" />
          {histories.length === 0 ? (
            <CardBody>
              <EmptyState message="발령 이력이 없습니다" />
            </CardBody>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>발령일</Th>
                  <Th>구분</Th>
                  <Th>사유</Th>
                </tr>
              </Thead>
              <tbody>
                {histories.map((history) => (
                  <Tr key={history.id}>
                    <Td>{formatDate(history.effectiveDate)}</Td>
                    <Td className="text-body">
                      {CHANGE_TYPE_LABEL[history.changeType] ?? history.changeType}
                    </Td>
                    <Td className="text-body">{history.reason ?? "-"}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </PageTransition>
  );
}
