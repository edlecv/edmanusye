import React from 'react';

const AdminPage = () => {
  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center text-primary dark:text-white">
          Administration Page
        </h1>
      </header>
      <div className="text-center text-gray-600 dark:text-gray-300">
        <p className="text-xl">This page is reserved for administrators.</p>
        <p className="mt-4">Content will be added later.</p>
      </div>
    </div>
  );
};

export default AdminPage;
