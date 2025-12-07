import type { Tree, Orchard, Log, TreeStatus } from "@/lib/types";

export const generateMockTrees = (): Tree[] => {
  const trees: Tree[] = [];
  const statuses: TreeStatus[] = ['healthy', 'sick', 'dead'];
  const varieties = ['หมอนทอง', 'ก้านยาว', 'ชะนี', 'พวงมณี', 'นกหยิบ'];
  
  trees.push({ id: 'uuid-1', orchardId: 'orchard-1', code: 'A01', zone: 'A', type: 'ทุเรียน', variety: 'หมอนทอง', plantedDate: '2020-05-15', status: 'healthy' });
  trees.push({ id: 'uuid-2', orchardId: 'orchard-1', code: 'A02', zone: 'A', type: 'ทุเรียน', variety: 'หมอนทอง', plantedDate: '2020-05-15', status: 'sick' });
  trees.push({ id: 'uuid-3', orchardId: 'orchard-1', code: 'A03', zone: 'A', type: 'ทุเรียน', variety: 'ก้านยาว', plantedDate: '2021-06-20', status: 'healthy' });
  trees.push({ id: 'uuid-4', orchardId: 'orchard-1', code: 'B01', zone: 'B', type: 'ทุเรียน', variety: 'หมอนทอง', plantedDate: '2019-04-10', status: 'healthy' });
  trees.push({ id: 'uuid-5', orchardId: 'orchard-1', code: 'B02', zone: 'B', type: 'ทุเรียน', variety: 'พวงมณี', plantedDate: '2019-04-10', status: 'dead' });
  trees.push({ id: 'uuid-6', orchardId: 'orchard-2', code: 'X01', zone: 'ริมน้ำ', type: 'ทุเรียน', variety: 'นกหยิบ', plantedDate: '2022-01-10', status: 'healthy' });
  trees.push({ id: 'uuid-7', orchardId: 'orchard-2', code: 'M01', zone: 'ริมน้ำ', type: 'มังคุด', variety: 'พื้นเมือง', plantedDate: '2018-05-20', status: 'healthy' });

  for (let i = 1; i <= 25; i++) {
      trees.push({ 
          id: `gen-${i}`, 
          orchardId: 'orchard-1', 
          code: `C${i.toString().padStart(2, '0')}`, 
          zone: 'C', 
          type: 'ทุเรียน', 
          variety: varieties[Math.floor(Math.random() * varieties.length)], 
          plantedDate: '2021-01-01', 
          status: statuses[i % statuses.length] 
      });
  }
  return trees;
};

export const INITIAL_ORCHARDS: Orchard[] = [
  { id: 'orchard-1', name: 'สวนแปลงใหญ่ (เขาสอยดาว)', zones: ['A', 'B', 'C'] },
  { id: 'orchard-2', name: 'สวนหลังบ้าน', zones: ['ริมน้ำ'] },
];

export const INITIAL_LOGS: Log[] = [
  { id: 1, orchardId: 'orchard-1', type: 'batch', zone: 'A', action: 'ใส่ปุ๋ยสูตร 15-15-15', date: '2023-10-01', note: 'เตรียมสะสมอาหาร', status: 'completed' },
  { id: 2, orchardId: 'orchard-1', type: 'batch', zone: 'B', action: 'พ่นยาป้องกันเชื้อรา', date: '2023-10-02', note: 'ฝนตกหนักต่อเนื่อง', status: 'completed' },
  { id: 3, orchardId: 'orchard-1', type: 'individual', treeId: 'uuid-2', action: 'ขูดแผลทายา', date: '2023-10-05', note: 'พบโรครากเน่าโคนเน่า แผลขนาด 5cm', status: 'in-progress', followUpDate: '2023-10-12' },
  { id: 4, orchardId: 'orchard-1', type: 'individual', treeId: 'uuid-5', action: 'ตรวจพบต้นตาย', date: '2023-09-20', note: 'ยืนต้นตาย', status: 'completed' },
  { id: 5, orchardId: 'orchard-1', type: 'individual', treeId: 'uuid-2', action: 'ฉีดพ่นอาหารเสริม', date: '2023-10-08', note: 'บำรุงใบอ่อน', status: 'in-progress', followUpDate: '2025-12-15' },
];
