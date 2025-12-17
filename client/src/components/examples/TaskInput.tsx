import TaskInput from "../TaskInput";

export default function TaskInputExample() {
  const handleAddTask = (task: string) => {
    console.log("Task added:", task);
  };

  const handleStartTasks = () => {
    console.log("Starting tasks");
  };

  return (
    <TaskInput 
      onAddTask={handleAddTask} 
      taskCount={3}
      onStartTasks={handleStartTasks}
    />
  );
}
