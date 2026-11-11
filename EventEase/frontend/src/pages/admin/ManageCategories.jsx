import { useState } from 'react';
import api, { errMsg } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { Spinner, ErrorBox, PageHeader, Table, ConfirmButton } from '../../components/UI';
export default function ManageCategories() {
  const toast = useToast(); const { data, loading, error, reload } = useFetch('/admin/categories');
  const [f, setF] = useState({ name: '', description: '' }); const [edit, setEdit] = useState(null);
  const run = async (fn, msg) => { try { await fn(); toast.success(msg); reload(); return true; } catch (e) { toast.error(errMsg(e)); } };
  const add = async e => { e.preventDefault(); if (await run(() => api.post('/admin/categories', f), 'Category added')) setF({ name: '', description: '' }); };
  const save = async () => { if (await run(() => api.put(`/admin/categories/${edit._id}`, edit), 'Category updated')) setEdit(null); };
  if (loading) return <Spinner />; if (error) return <ErrorBox message={error} retry={reload} />;
  return (<>
    <PageHeader title="Categories" subtitle="Organize events into categories" />
    <form onSubmit={add} className="card mb-6 flex flex-wrap items-end gap-3 p-4"><div><label className="label">Name</label><input required className="input" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div><div className="min-w-[16rem] flex-1"><label className="label">Description</label><input className="input" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></div><button className="btn-primary">Add category</button></form>
    <Table head={['Name', 'Description', 'Actions']}>{data.categories.map(c => (<tr key={c._id}>
      {edit?._id === c._id ? (<><td className="td"><input className="input" value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} /></td><td className="td"><input className="input" value={edit.description} onChange={e => setEdit({ ...edit, description: e.target.value })} /></td><td className="td space-x-2"><button className="btn-primary px-3 py-1.5" onClick={save}>Save</button><button className="btn-outline px-3 py-1.5" onClick={() => setEdit(null)}>Cancel</button></td></>) :
        (<><td className="td font-semibold">{c.name}</td><td className="td text-slate-500">{c.description}</td><td className="td space-x-2"><button className="btn-outline px-3 py-1.5" onClick={() => setEdit(c)}>Edit</button><ConfirmButton className="btn-danger px-3 py-1.5" message="Delete category?" onConfirm={() => run(() => api.delete(`/admin/categories/${c._id}`), 'Category deleted')}>Delete</ConfirmButton></td></>)}
    </tr>))}</Table>
  </>);
}
