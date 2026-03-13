export type TaskStatus = 'Pending' | 'In Progress' | 'Completed'
export type TaskPriority = 'High' | 'Medium' | 'Low'

export interface TaskMaterial {
  id: string
  name: string
  quantity: string
}

export interface MyTask {
  id: string
  projectName: string
  priority: TaskPriority
  taskName: string
  deadline: string
  location: string
  description: string
  status: TaskStatus
  instructions?: string[]
  materials?: TaskMaterial[]
}

export const myTaskMockData: MyTask[] = [
  {
    id: '1',
    projectName: 'Green Villa',
    priority: 'High',
    taskName: 'Plant 10 Plum Tree',
    deadline: '2026-02-12',
    location: '123 Riverside Drive, Park Section A',
    description:
      'Complete lawn mowing for Section A of Riverside Park. Ensure edges are trimmed and all grass clippings are collected. Pay special attention to areas near flower beds.',
    status: 'Pending',
    instructions: [
      'Inspect area before the work',
      'Inspect area before the work',
      'Inspect area before the work',
      'Inspect area before the work',
      'Inspect area before the work',
    ],
    materials: [
      { id: 'm1', name: 'String Trimmer', quantity: '1 Unit' },
      { id: 'm2', name: 'String Trimmer', quantity: '1 Unit' },
      { id: 'm3', name: 'String Trimmer', quantity: '1 Unit' },
    ],
  },
  {
    id: '2',
    projectName: 'Green Villa',
    priority: 'High',
    taskName: 'Install Concrete Pavers',
    deadline: '2026-02-12',
    location: '123 Riverside Drive, Park Section A',
    description:
      'Install concrete pavers in the backyard patio area according to the approved design plan. Before starting installation, ensure the ground has been properly excavated and leveled to the required depth. Lay and compact the gravel base evenly, followed by a sand layer to create a smooth foundation. Place pavers in the specified pattern shown in the design document. Maintain equal spacing between each paver and ensure proper alignment using string lines. After placement, fill the joints with polymeric sand and compact the surface again.',
    status: 'In Progress',
    instructions: [
      'Inspect area before the work',
      'Inspect area before the work',
      'Inspect area before the work',
      'Inspect area before the work',
      'Inspect area before the work',
    ],
    materials: [
      { id: 'm1', name: 'String Trimmer', quantity: '1 Unit' },
      { id: 'm2', name: 'String Trimmer', quantity: '1 Unit' },
      { id: 'm3', name: 'String Trimmer', quantity: '1 Unit' },
    ],
  },
  {
    id: '3',
    projectName: 'Riverside Park',
    priority: 'Medium',
    taskName: 'Lawn Mowing Section B',
    deadline: '2026-02-15',
    location: '456 Park Avenue, Section B',
    description:
      'Mow the lawn in Section B of Riverside Park. Ensure consistent cutting height and collect all grass clippings.',
    status: 'Pending',
    instructions: ['Inspect area before the work', 'Check equipment'],
    materials: [{ id: 'm1', name: 'Lawn Mower', quantity: '1 Unit' }],
  },
  {
    id: '4',
    projectName: 'Sunset Gardens',
    priority: 'Low',
    taskName: 'Prune Hedges',
    deadline: '2026-02-20',
    location: '789 Garden Lane',
    description:
      'Prune all hedges along the main walkway. Maintain uniform height and shape.',
    status: 'In Progress',
    instructions: ['Wear safety gear', 'Inspect area before the work'],
    materials: [
      { id: 'm1', name: 'Hedge Trimmer', quantity: '1 Unit' },
      { id: 'm2', name: 'Safety Gloves', quantity: '1 Pair' },
    ],
  },
  {
    id: '5',
    projectName: 'Oakwood Estate',
    priority: 'High',
    taskName: 'Irrigation Repair',
    deadline: '2026-02-18',
    location: '321 Oak Street',
    description:
      'Repair broken irrigation lines in the north section. Replace damaged sprinkler heads and test system.',
    status: 'Pending',
    instructions: [
      'Locate main valve',
      'Inspect damaged area',
      'Replace components',
      'Test system',
    ],
    materials: [
      { id: 'm1', name: 'Sprinkler Head', quantity: '5 Units' },
      { id: 'm2', name: 'PVC Pipe', quantity: '10 ft' },
    ],
  },
]
