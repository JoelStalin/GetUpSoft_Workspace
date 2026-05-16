export type PromptStep = {
  done: boolean;
};

export type PromptTask = {
  technicalWeight: number;
  steps: PromptStep[];
};

export type PromptEpic = {
  tasks: PromptTask[];
};

export class PromptTracker {
  progress(epics: PromptEpic[]): number {
    let totalWeight = 0;
    let completedWeight = 0;

    for (const epic of epics) {
      for (const task of epic.tasks) {
        totalWeight += task.technicalWeight;
        if (task.steps.length === 0) {
          continue;
        }
        const doneCount = task.steps.filter((step) => step.done).length;
        completedWeight +=
          (doneCount / task.steps.length) * task.technicalWeight;
      }
    }

    if (totalWeight === 0) {
      return 0;
    }

    return Number(((completedWeight / totalWeight) * 100).toFixed(2));
  }
}
