import type { Tree, Orchard, Log, TreeStatus } from "@/lib/types";

export const generateMockTrees = (): Tree[] => {
  const trees: Tree[] = [];
  const statuses: TreeStatus[] = ['HEALTHY', 'SICK', 'DEAD'];
  const varieties = ['หมอนทอง', 'ก้านยาว', 'ชะนี', 'พวงมณี', 'นกหยิบ'];

  trees.push({ id: 'uuid-1', orchardId: 'orchard-1', code: 'A01', zone: 'A', type: 'ทุเรียน', variety: 'หมอนทอง', plantedDate: '2020-05-15', status: 'HEALTHY', createdAt: '2020-05-15T00:00:00.000Z', updatedAt: '2020-05-15T00:00:00.000Z' });
  trees.push({ id: 'uuid-2', orchardId: 'orchard-1', code: 'A02', zone: 'A', type: 'ทุเรียน', variety: 'หมอนทอง', plantedDate: '2020-05-15', status: 'SICK', createdAt: '2020-05-15T00:00:00.000Z', updatedAt: '2020-05-15T00:00:00.000Z' });
  trees.push({ id: 'uuid-3', orchardId: 'orchard-1', code: 'A03', zone: 'A', type: 'ทุเรียน', variety: 'ก้านยาว', plantedDate: '2021-06-20', status: 'HEALTHY', createdAt: '2021-06-20T00:00:00.000Z', updatedAt: '2021-06-20T00:00:00.000Z' });
  trees.push({ id: 'uuid-4', orchardId: 'orchard-1', code: 'B01', zone: 'B', type: 'ทุเรียน', variety: 'หมอนทอง', plantedDate: '2019-04-10', status: 'HEALTHY', createdAt: '2019-04-10T00:00:00.000Z', updatedAt: '2019-04-10T00:00:00.000Z' });
  trees.push({ id: 'uuid-5', orchardId: 'orchard-1', code: 'B02', zone: 'B', type: 'ทุเรียน', variety: 'พวงมณี', plantedDate: '2019-04-10', status: 'DEAD', createdAt: '2019-04-10T00:00:00.000Z', updatedAt: '2019-04-10T00:00:00.000Z' });
  trees.push({ id: 'uuid-6', orchardId: 'orchard-2', code: 'X01', zone: 'ริมน้ำ', type: 'ทุเรียน', variety: 'นกหยิบ', plantedDate: '2022-01-10', status: 'HEALTHY', createdAt: '2022-01-10T00:00:00.000Z', updatedAt: '2022-01-10T00:00:00.000Z' });
  trees.push({ id: 'uuid-7', orchardId: 'orchard-2', code: 'M01', zone: 'ริมน้ำ', type: 'มังคุด', variety: 'พื้นเมือง', plantedDate: '2018-05-20', status: 'HEALTHY', createdAt: '2018-05-20T00:00:00.000Z', updatedAt: '2018-05-20T00:00:00.000Z' });

  for (let i = 1; i <= 25; i++) {
      trees.push({
          id: `gen-${i}`,
          orchardId: 'orchard-1',
          code: `C${i.toString().padStart(2, '0')}`,
          zone: 'C',
          type: 'ทุเรียน',
          variety: varieties[Math.floor(Math.random() * varieties.length)],
          plantedDate: '2021-01-01',
          status: statuses[i % statuses.length],
          createdAt: '2021-01-01T00:00:00.000Z',
          updatedAt: '2021-01-01T00:00:00.000Z'
      });
  }
  return trees;
};

export const INITIAL_ORCHARDS: Orchard[] = [
  { id: 'orchard-1', ownerId: 'user-1', name: 'สวนแปลงใหญ่ (เขาสอยดาว)', zones: ['A', 'B', 'C'], createdAt: '2020-01-01T00:00:00.000Z' },
  { id: 'orchard-2', ownerId: 'user-1', name: 'สวนหลังบ้าน', zones: ['ริมน้ำ'], createdAt: '2020-01-01T00:00:00.000Z' },
];

export const INITIAL_LOGS: Log[] = [
  { id: 'log-1', orchardId: 'orchard-1', logType: 'BATCH', targetZone: 'A', action: 'ใส่ปุ๋ยสูตร 15-15-15', note: 'เตรียมสะสมอาหาร', performDate: '2023-10-01', status: 'COMPLETED', createdAt: '2023-10-01T00:00:00.000Z' },
  { id: 'log-2', orchardId: 'orchard-1', logType: 'BATCH', targetZone: 'B', action: 'พ่นยาป้องกันเชื้อรา', note: 'ฝนตกหนักต่อเนื่อง', performDate: '2023-10-02', status: 'COMPLETED', createdAt: '2023-10-02T00:00:00.000Z' },
  { id: 'log-3', orchardId: 'orchard-1', logType: 'INDIVIDUAL', treeId: 'uuid-2', action: 'ขูดแผลทายา', note: 'พบโรครากเน่าโคนเน่า แผลขนาด 5cm', performDate: '2023-10-05', status: 'IN_PROGRESS', followUpDate: '2023-10-12', createdAt: '2023-10-05T00:00:00.000Z' },
  { id: 'log-4', orchardId: 'orchard-1', logType: 'INDIVIDUAL', treeId: 'uuid-5', action: 'ตรวจพบต้นตาย', note: 'ยืนต้นตาย', performDate: '2023-09-20', status: 'COMPLETED', createdAt: '2023-09-20T00:00:00.000Z' },
  { id: 'log-5', orchardId: 'orchard-1', logType: 'INDIVIDUAL', treeId: 'uuid-2', action: 'ฉีดพ่นอาหารเสริม', note: 'บำรุงใบอ่อน', performDate: '2023-10-08', status: 'IN_PROGRESS', followUpDate: '2025-12-15', createdAt: '2023-10-08T00:00:00.000Z' },
];
