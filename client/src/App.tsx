import { useState, useEffect } from "react";
import TaskInput from "@/components/TaskInput";
import TaskDisplay from "@/components/TaskDisplay";

const STORAGE_KEY = "whatdoidonow-tasks";

function loadTasks(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    console.error("Failed to load tasks from storage");
  }
  return [];
}

function saveTasks(tasks: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    console.error("Failed to save tasks to storage");
  }
}

type View = "input" | "focus";

function App() {
  const [tasks, setTasks] = useState<string[]>(loadTasks);
  const [view, setView] = useState<View>(() => {
    const loaded = loadTasks();
    return loaded.length > 0 ? "focus" : "input";
  });

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const handleAddTask = (task: string) => {
    setTasks((prev) => [...prev, task]);
  };

  const handleDone = () => {
    setTasks((prev) => {
      const newTasks = prev.slice(1);
      if (newTasks.length === 0) {
        setView("input");
      }
      return newTasks;
    });
  };

  const handleSkip = () => {
    setTasks((prev) => {
      if (prev.length <= 1) return prev;
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  const handleStartTasks = () => {
    if (tasks.length > 0) {
      setView("focus");
    }
  };

  const handleAddMore = () => {
    setView("input");
  };

  const currentTask = tasks[0];

  if (view === "input" || !currentTask) {
    return (
      <TaskInput 
        onAddTask={handleAddTask} 
        taskCount={tasks.length}
        onStartTasks={handleStartTasks}
      />
    );
  }

  return (
    <TaskDisplay 
      task={currentTask} 
      onDone={handleDone} 
      onSkip={handleSkip}
      taskPosition={1}
      totalTasks={tasks.length}
      onAddMore={handleAddMore}
    />
  );
}

export default App;
