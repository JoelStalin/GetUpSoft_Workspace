export function mergeWorkflowState(base, saved) {
  const savedById = new Map((saved?.nodes || []).map((node) => [node.id, node]));
  const nodes = (base.nodes || []).map((baseNode) => {
    const stored = savedById.get(baseNode.id);
    if (!stored) return baseNode;
    const storedParameters = stored.data?.parameters || stored.parameters || {};
    return {
      ...baseNode,
      position: stored.position || baseNode.position,
      positionArray: stored.positionArray || baseNode.positionArray,
      x: stored.x ?? stored.position?.x ?? baseNode.x,
      y: stored.y ?? stored.position?.y ?? baseNode.y,
      data: {
        ...baseNode.data,
        label: stored.data?.label ?? baseNode.data.label,
        description: stored.data?.description ?? baseNode.data.description,
        imageUrl: stored.data?.imageUrl ?? baseNode.data.imageUrl,
        parameters: { ...baseNode.data.parameters, ...storedParameters },
        // configuration_schema and n8n_equivalent intentionally come from base.
      },
    };
  });
  const mutable = saved || {};
  return {
    ...base,
    name: mutable.name || base.name,
    active: Boolean(mutable.active),
    settings: { ...(base.settings || {}), ...(mutable.settings || {}) },
    nodes,
    connections: mutable.connections || base.connections,
    edges: mutable.edges || base.edges,
    links: mutable.links || mutable.edges || base.links,
    updatedAt: mutable.updatedAt || base.updatedAt,
  };
}
