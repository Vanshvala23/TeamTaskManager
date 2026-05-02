function StatCard({ title, value }) {

  return (

    <div className='bg-white rounded-3xl p-7 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>

      <p className='text-gray-500 text-lg font-medium'>
        {title}
      </p>

      <h1 className='text-5xl font-black mt-5 text-gray-800'>
        {value}
      </h1>

    </div>
  );
}

export default StatCard;