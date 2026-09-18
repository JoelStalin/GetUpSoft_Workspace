# Orca Agent Core Integration

## NemoClaw

Source repository:
`https://github.com/JoelStalin/NemoClaw.git`

Local reference:
`C:/Users/yoeli/Documents/GetUpSoft_Workspace/03_AI_Automation/NemoClaw`

License:
Apache-2.0

Status:
Reference integrated into Orca frontend core registry. No sandbox deployment, tunnel change, or host service operation has been performed.

## Integrated Concepts

- Plugin layer: OpenClaw command/provider registration model.
- Blueprint lifecycle: `resolve -> verify -> plan -> apply -> status -> rollback`.
- Sandbox layer: OpenShell/OpenClaw isolated execution environment.
- Policy layer: declarative network, filesystem, process, and inference protection.
- Inference route: provider calls routed through a managed gateway, with raw credentials host-side.
- Host state model: credentials and sandbox metadata live outside the sandbox.

## Orca Files

- `src/core/agents/nemoclawCore.ts`: typed NemoClaw core profile, inference profiles, lifecycle, and node definitions.
- `src/constants/stitchMemoryComponents.ts`: exposes NemoClaw nodes under the `Agent Core` component category.
- `src/utils/nodeIcons.ts`: maps NemoClaw nodes to UI icons.
- `src/components/modes/AIMode.tsx`: shows NemoClaw core status and protection layers in AI mode.

## NemoClaw Nodes

- `NemoClaw Sandbox`
- `NemoClaw Policy`
- `Inference Route`
- `Blueprint Plan`
- `Sandbox Status`

These nodes are design/orchestration nodes for Orca's shared canvas. They do not create, stop, remove, or reroute real sandboxes by themselves.
