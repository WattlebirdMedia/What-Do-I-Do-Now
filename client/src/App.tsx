import { useState, useEffect } from "react";
import TaskInput from "@/components/TaskInput";
import TaskDisplay from "@/components/TaskDisplay";
import CompletedTasks from "@/components/CompletedTasks";

const STORAGE_KEY = "whatdoidonow-tasks";
const COMPLETED_KEY = "whatdoidonow-completed";

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

interface CompletedTask {
  text: string;
  completedAt: string;
}

function loadCompletedTasks(): CompletedTask[] {
  try {
    const stored = localStorage.getItem(COMPLETED_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    console.error("Failed to load completed tasks from storage");
  }
  return [];
}

function saveCompletedTasks(tasks: CompletedTask[]) {
  try {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(tasks));
  } catch {
    console.error("Failed to save completed tasks to storage");
  }
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

type View = "input" | "focus" | "completed";

function App() {
  const [tasks, setTasks] = useState<string[]>(loadTasks);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>(loadCompletedTasks);
  const [view, setView] = useState<View>(() => {
    const loaded = loadTasks();
    return loaded.length > 0 ? "focus" : "input";
  });

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveCompletedTasks(completedTasks);
  }, [completedTasks]);

  const handleAddTask = (task: string) => {
    setTasks((prev) => [...prev, task]);
  };

  const handleDone = () => {
    const completedTask = tasks[0];
    if (completedTask) {
      setCompletedTasks((prev) => [...prev, {
        text: completedTask,
        completedAt: new Date().toISOString()
      }]);
    }
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

  const handleViewCompleted = () => {
    setView("completed");
  };

  const handleBackFromCompleted = () => {
    setView(tasks.length > 0 ? "focus" : "input");
  };

  const handleClearCompleted = () => {
    setCompletedTasks([]);
  };

  const todayCompleted = completedTasks.filter(
    (t) => t.completedAt.split('T')[0] === getTodayDateString()
  );

  const currentTask = tasks[0];

  if (view === "completed") {
    return (
      <CompletedTasks
        tasks={todayCompleted}
        onBack={handleBackFromCompleted}
        onClear={handleClearCompleted}
      />
    );
  }

  if (view === "input" || !currentTask) {
    return (
      <TaskInput 
        onAddTask={handleAddTask} 
        taskCount={tasks.length}
        onStartTasks={handleStartTasks}
        completedCount={todayCompleted.length}
        onViewCompleted={handleViewCompleted}
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
      completedCount={todayCompleted.length}
      onViewCompleted={handleViewCompleted}
    />
  );
}

export default App;
