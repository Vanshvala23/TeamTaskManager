import { useEffect, useState } from 'react';

import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';

function Projects() {

  const [projects, setProjects] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [editingProjectId, setEditingProjectId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // =========================
  // MEMBER STATES
  // =========================

  const [selectedProject, setSelectedProject] = useState(null);

  const [members, setMembers] = useState([]);

  const [memberEmail, setMemberEmail] = useState('');

  const [memberRole, setMemberRole] = useState('member');

  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  // =========================
  // FETCH PROJECTS
  // =========================

  const fetchProjects = async () => {

    try {

      setLoading(true);

      const res = await API.get('/projects');

      if (Array.isArray(res.data.projects)) {
        setProjects(res.data.projects);
      } else {
        setProjects([]);
      }

    } catch (error) {

      console.log(error);

      setProjects([]);

      alert(
        error?.response?.data?.error ||
        'Failed to fetch projects'
      );

    } finally {

      setLoading(false);
    }
  };

  // =========================
  // FETCH MEMBERS
  // =========================

  const fetchMembers = async (projectId) => {

    try {

      const res = await API.get(
        `/projects/${projectId}`
      );

      setMembers(res.data.members || []);

      setSelectedProject(projectId);

    } catch (error) {

      console.log(error);

      alert(
        error?.response?.data?.error ||
        'Failed to fetch members'
      );
    }
  };

  // =========================
  // CREATE PROJECT
  // =========================

  const createProject = async (e) => {

    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      return alert('Please fill all fields');
    }

    try {

      setCreating(true);

      const res = await API.post('/projects', {
        name: title,
        description
      });

      setProjects((prev) => [
        res.data.project,
        ...prev
      ]);

      setTitle('');
      setDescription('');

    } catch (error) {

      console.log(error);

      alert(
        error?.response?.data?.error ||
        'Failed to create project'
      );

    } finally {

      setCreating(false);
    }
  };

  // =========================
  // UPDATE PROJECT
  // =========================

  const updateProject = async (e) => {

    e.preventDefault();

    try {

      setCreating(true);

      const res = await API.put(
        `/projects/${editingProjectId}`,
        {
          name: title,
          description
        }
      );

      setProjects((prev) =>
        prev.map((project) =>
          project.id === editingProjectId
            ? {
                ...project,
                ...res.data.project
              }
            : project
        )
      );

      setEditingProjectId(null);

      setTitle('');
      setDescription('');

    } catch (error) {

      console.log(error);

      alert(
        error?.response?.data?.error ||
        'Failed to update project'
      );

    } finally {

      setCreating(false);
    }
  };

  // =========================
  // DELETE PROJECT
  // =========================

  const deleteProject = async (projectId) => {

    const confirmDelete = window.confirm(
      'Delete this project?'
    );

    if (!confirmDelete) return;

    try {

      await API.delete(`/projects/${projectId}`);

      setProjects((prev) =>
        prev.filter((p) => p.id !== projectId)
      );

    } catch (error) {

      console.log(error);

      alert(
        error?.response?.data?.error ||
        'Failed to delete project'
      );
    }
  };

  // =========================
  // START EDIT
  // =========================

  const startEdit = (project) => {

    setEditingProjectId(project.id);

    setTitle(project.name);

    setDescription(project.description || '');
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const cancelEdit = () => {

    setEditingProjectId(null);

    setTitle('');

    setDescription('');
  };

  // =========================
  // ADD MEMBER
  // =========================

  const addMember = async () => {

    if (!memberEmail.trim()) {
      return alert('Enter member email');
    }

    try {

      setAddingMember(true);

      await API.post(
        `/projects/${selectedProject}/members`,
        {
          email: memberEmail,
          role: memberRole
        }
      );

      setMemberEmail('');

      setMemberRole('member');

      fetchMembers(selectedProject);

      fetchProjects();

    } catch (error) {

      console.log(error);

      alert(
        error?.response?.data?.error ||
        'Failed to add member'
      );

    } finally {

      setAddingMember(false);
    }
  };

  // =========================
  // REMOVE MEMBER
  // =========================

  const removeMember = async (userId) => {

    const confirmRemove = window.confirm(
      'Remove this member?'
    );

    if (!confirmRemove) return;

    try {

      await API.delete(
        `/projects/${selectedProject}/members/${userId}`
      );

      setMembers((prev) =>
        prev.filter((m) => m.id !== userId)
      );

      fetchProjects();

    } catch (error) {

      console.log(error);

      alert(
        error?.response?.data?.error ||
        'Failed to remove member'
      );
    }
  };

  return (

    <DashboardLayout>

      {/* HEADER */}

      <div className='flex items-center justify-between mb-8'>

        <div>

          <h1 className='text-4xl font-bold text-gray-800'>
            Projects
          </h1>

          <p className='text-gray-500 mt-2'>
            Manage your team projects
          </p>

        </div>

      </div>

      {/* FORM */}

      <form
        onSubmit={
          editingProjectId
            ? updateProject
            : createProject
        }
        className='bg-white p-6 rounded-2xl shadow-lg mb-10'
      >

        <h2 className='text-2xl font-bold mb-6'>

          {
            editingProjectId
              ? 'Edit Project'
              : 'Create New Project'
          }

        </h2>

        <input
          type='text'
          placeholder='Project Title'
          className='w-full border border-gray-300 p-4 rounded-xl mb-4'
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <textarea
          placeholder='Project Description'
          className='w-full border border-gray-300 p-4 rounded-xl mb-4 h-32 resize-none'
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />

        <div className='flex gap-4'>

          <button
            disabled={creating}
            className='bg-black text-white px-8 py-3 rounded-xl'
          >

            {
              creating
                ? (
                  editingProjectId
                    ? 'Updating...'
                    : 'Creating...'
                )
                : (
                  editingProjectId
                    ? 'Update Project'
                    : 'Create Project'
                )
            }

          </button>

          {
            editingProjectId && (

              <button
                type='button'
                onClick={cancelEdit}
                className='bg-gray-300 px-8 py-3 rounded-xl'
              >
                Cancel
              </button>
            )
          }

        </div>

      </form>

      {/* PROJECTS */}

      {!loading && projects.length > 0 && (

        <div className='grid md:grid-cols-2 xl:grid-cols-3 gap-6'>

          {projects.map((project) => (

            <div
              key={project.id}
              className='bg-white p-6 rounded-2xl shadow-lg'
            >

              {/* TOP */}

              <div className='flex items-center justify-between mb-4'>

                <h2 className='text-2xl font-bold'>
                  {project.name}
                </h2>

                <span className='bg-black text-white px-3 py-1 rounded-full text-sm'>
                  {project.role}
                </span>

              </div>

              {/* DESCRIPTION */}

              <p className='text-gray-600 min-h-[80px]'>
                {
                  project.description ||
                  'No description'
                }
              </p>

              {/* STATS */}

              <div className='mt-6 space-y-2'>

                <div className='flex justify-between text-sm'>

                  <span>
                    Members
                  </span>

                  <span>
                    {project.member_count}
                  </span>

                </div>

                <div className='flex justify-between text-sm'>

                  <span>
                    Tasks
                  </span>

                  <span>
                    {project.task_count}
                  </span>

                </div>

              </div>

              {/* FOOTER */}

              <div className='mt-6 pt-4 border-t'>

                <div className='flex justify-between mb-4'>

                  <span className='text-sm text-gray-500'>
                    Created by
                  </span>

                  <span className='font-semibold'>
                    {project.creator_name}
                  </span>

                </div>

                {/* ADMIN ACTIONS */}

                {
                  project.role === 'admin' && (

                    <div className='space-y-3'>

                      <div className='flex gap-3'>

                        <button
                          onClick={() =>
                            startEdit(project)
                          }
                          className='flex-1 bg-blue-600 text-white py-2 rounded-xl'
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteProject(project.id)
                          }
                          className='flex-1 bg-red-600 text-white py-2 rounded-xl'
                        >
                          Delete
                        </button>

                      </div>

                      <button
                        onClick={() =>
                          fetchMembers(project.id)
                        }
                        className='w-full bg-green-600 text-white py-2 rounded-xl'
                      >
                        Manage Members
                      </button>

                    </div>
                  )
                }

              </div>

            </div>
          ))}

        </div>
      )}

      {/* MEMBER MANAGEMENT */}

      {
        selectedProject && (

          <div className='bg-white p-6 rounded-2xl shadow-lg mt-10'>

            <h2 className='text-2xl font-bold mb-6'>
              Project Members
            </h2>

            {/* ADD MEMBER */}

            <div className='flex gap-4 mb-6'>

              <input
                type='email'
                placeholder='Enter user email'
                value={memberEmail}
                onChange={(e) =>
                  setMemberEmail(e.target.value)
                }
                className='flex-1 border border-gray-300 p-4 rounded-xl'
              />

              <select
                value={memberRole}
                onChange={(e) =>
                  setMemberRole(e.target.value)
                }
                className='border border-gray-300 p-4 rounded-xl'
              >

                <option value='member'>
                  Member
                </option>

                <option value='admin'>
                  Admin
                </option>

              </select>

              <button
                onClick={addMember}
                disabled={addingMember}
                className='bg-black text-white px-6 rounded-xl'
              >

                {
                  addingMember
                    ? 'Adding...'
                    : 'Add Member'
                }

              </button>

            </div>

            {/* MEMBERS LIST */}

            <div className='space-y-4'>

              {members.map((member) => (

                <div
                  key={member.id}
                  className='border p-4 rounded-xl flex items-center justify-between'
                >

                  <div>

                    <h3 className='font-bold'>
                      {member.name}
                    </h3>

                    <p className='text-sm text-gray-500'>
                      {member.email}
                    </p>

                  </div>

                  <div className='flex items-center gap-4'>

                    <span className='capitalize bg-gray-100 px-3 py-1 rounded-full text-sm'>
                      {member.role}
                    </span>

                    <button
                      onClick={() =>
                        removeMember(member.id)
                      }
                      className='bg-red-600 text-white px-4 py-2 rounded-xl'
                    >
                      Remove
                    </button>

                  </div>

                </div>
              ))}

            </div>

          </div>
        )
      }

    </DashboardLayout>
  );
}

export default Projects;