import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { PageTransition } from "@/components/layout/page-transition";
import { ActiveBadge, Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, EmptyState } from "@/components/ui/card";
import { Table, Td, Th, Thead, Tr } from "@/components/ui/table";
import { flattenDepartmentTree, getDepartmentTree, listPositions } from "@/lib/api/org";
import type { DepartmentTreeRes } from "@/lib/api/types";
import { CreateDepartmentDialog, CreatePositionDialog } from "./create-dialogs";

export const metadata: Metadata = { title: "조직 · greentech" };

// MARK: - 조직도
// 부서 계층 + 직위 서열

function DepartmentNode({ node, depth = 0 }: { node: DepartmentTreeRes; depth?: number }) {
  return (
    <>
      <div
        className="flex items-center gap-xs border-b border-hairline py-xs last:border-0"
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        {depth > 0 ? <span className="text-mute">└</span> : null}
        <span className="text-caption text-mute tabular-nums">{node.code}</span>
        <span className={depth === 0 ? "text-body-sm font-medium" : "text-body-sm"}>
          {node.name}
        </span>
        {!node.active ? <Badge tone="inactive">미사용</Badge> : null}
      </div>
      {node.children?.map((child) => (
        <DepartmentNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </>
  );
}

export default async function OrganizationPage() {
  const [tree, positions] = await Promise.all([getDepartmentTree(), listPositions()]);

  const departments = flattenDepartmentTree(tree);
  const nextLevel = positions.reduce((max, position) => Math.max(max, position.levelNo), 0) + 1;

  return (
    <PageTransition>
      <PageHeader eyebrow="조직" title="조직 구조" description="부서 계층과 직위 체계" />

      <div className="grid gap-md xl:grid-cols-2">
        <Card>
          <CardHeader
            title="부서"
            description={`최상위 ${tree.length}개 본부 · 전체 ${departments.length}개`}
            action={<CreateDepartmentDialog departments={departments} />}
          />
          <CardBody>
            {tree.length === 0 ? (
              <EmptyState message="등록된 부서가 없습니다" />
            ) : (
              tree.map((node) => <DepartmentNode key={node.id} node={node} />)
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="직위"
            description={`총 ${positions.length}단계`}
            action={<CreatePositionDialog nextLevel={nextLevel} />}
          />
          {positions.length === 0 ? (
            <CardBody>
              <EmptyState message="등록된 직위가 없습니다" />
            </CardBody>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>서열</Th>
                  <Th>코드</Th>
                  <Th>직위명</Th>
                  <Th>사용</Th>
                </tr>
              </Thead>
              <tbody>
                {positions.map((position) => (
                  <Tr key={position.id}>
                    <Td className="text-caption text-mute tabular-nums">{position.levelNo}</Td>
                    <Td className="text-caption text-body tabular-nums">{position.code}</Td>
                    <Td className="font-medium">{position.name}</Td>
                    <Td>
                      <ActiveBadge active={position.active} />
                    </Td>
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
