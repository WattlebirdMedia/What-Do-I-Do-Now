import TaskDisplay from "../TaskDisplay";

export default function TaskDisplayExample() {
  const handleDone = () => {
    console.log("Task marked as done");
  };

  const handleSkip = () => {
    console.log("Task skipped");
  };

  const handleAddMore = () => {
    console.log("Add more tasks");
  };

  return (
    <TaskDisplay 
      task="Reply to the important email" 
      onDone={handleDone} 
      onSkip={handleSkip}
      taskPosition={1}
      totalTasks={5}
      onAddMore={handleAddMore}
    />
  );
}
