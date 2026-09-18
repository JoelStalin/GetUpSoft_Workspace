import { useEffect, useState } from 'react'
import { Canvas3D } from './components/Canvas3D/Canvas3D'
import { useWorkflowStore } from './store/workflowStore'

export default function AppSimple() {
  const [isLoading, setIsLoading] = useState(true)
  const workflow = useWorkflowStore((state) => state.workflow)
  const setWorkflow = useWorkflowStore((state) => state.setWorkflow)

  useEffect(() => {
    const initWorkflow = async () => {
      try {
        setWorkflow({
          id: `workflow-${Date.now()}`,
          name: 'New Workflow',
          active: false,
          nodes: [],
          edges: [],
          settings: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing workflow:', error)
        setIsLoading(false)
      }
    }

    initWorkflow()
  }, [setWorkflow])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0e27] text-white">
        <div className="text-center">
          <div className="mb-4 text-lg">Loading 3D Canvas...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0e27] text-white flex flex-col">
      <div className="flex-1 overflow-hidden relative bg-[#0a0e27]">
        {workflow ? (
          <Canvas3D />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">No Workflow</h2>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
