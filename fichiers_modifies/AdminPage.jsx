import React from 'react';

const AdminPage = () => {
  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center text-primary dark:text-white">
          Page d'Administration
        </h1>
      </header>
      <div className="text-center text-gray-600 dark:text-gray-300">
        <p className="text-xl">Cette page est réservée à l'administrateur.</p>
        <p className="mt-4">Le contenu sera ajouté ultérieurement.</p>
      </div>
    </div>
  );
};

export default AdminPage;
