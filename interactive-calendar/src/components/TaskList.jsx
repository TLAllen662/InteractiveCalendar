function TaskList({ tasks, onToggle, onEdit, onDelete, canEdit }) {
  if (tasks.length === 0) return <p className="empty-state">No tasks for this day yet.</p>

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li className="task-item" key={task.id}>
          <label className="task-label">
            <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} disabled={!canEdit} />
            <span className={task.completed ? 'completed' : ''}>{task.title}</span>
          </label>
          <div className="task-actions">
            <button type="button" className="text-button" onClick={() => onEdit(task)} disabled={!canEdit} aria-label={`Edit ${task.title}`}>Edit</button>
            <button type="button" className="text-button" onClick={() => onDelete(task.id)} disabled={!canEdit} aria-label={`Delete ${task.title}`}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default TaskList
