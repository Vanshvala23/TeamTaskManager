function TaskCard({ task }) {

  const getStatusColor = () => {

    switch (task.status) {

      case 'done':
        return 'bg-green-100 text-green-700';

      case 'inprogress':
        return 'bg-blue-100 text-blue-700';

      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (

    <div className='bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>

      <div className='flex items-center justify-between mb-5'>

        <h2 className='text-2xl font-bold text-gray-800'>
          {task.title}
        </h2>

        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor()}`}>
          {task.status}
        </span>

      </div>

      <p className='text-gray-600 leading-7 min-h-[80px]'>
        {task.description || 'No description available'}
      </p>

      <div className='mt-6 flex items-center justify-between'>

        <div>
          <p className='text-sm text-gray-400'>Assigned To</p>
          <h3 className='font-bold text-gray-700'>
            {task.assignee_name || 'Unassigned'}
          </h3>
        </div>

        <div>
          <p className='text-sm text-gray-400'>Priority</p>
          <h3 className='font-bold capitalize text-violet-600'>
            {task.priority}
          </h3>
        </div>

      </div>

    </div>
  );
}

export default TaskCard;