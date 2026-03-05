import { getAdminWorkspaces } from "@/server/actions/admin-data-actions";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";

export default async function AdminWorkspacesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const { workspaces, total, pages } = await getAdminWorkspaces(page);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Workspaces</h1>
      <p className="text-slate-400 text-sm mb-6">{total.toLocaleString()} total</p>

      <div className="rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Owner</th>
              <th className="px-4 py-3 text-center font-semibold">Members</th>
              <th className="px-4 py-3 text-center font-semibold">Boards</th>
              <th className="px-4 py-3 text-center font-semibold">Created</th>
              <th className="px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {workspaces.map((ws) => (
              <tr key={ws.id} className="hover:bg-slate-800/40 text-slate-300">
                <td className="px-4 py-3 font-medium text-white">{ws.name}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{ws.owner.name} <br/><span className="text-slate-500">{ws.owner.email}</span></td>
                <td className="px-4 py-3 text-center">{ws._count.members}</td>
                <td className="px-4 py-3 text-center">{ws._count.boards}</td>
                <td className="px-4 py-3 text-center text-xs">{new Date(ws.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-center">
                  <AdminDeleteButton type="workspace" id={ws.id} label={ws.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex gap-2 justify-end">
          {Array.from({ length: pages }, (_, i) => (
            <a
              key={i}
              href={`?page=${i + 1}`}
              className={`px-3 py-1 rounded text-xs font-medium ${
                page === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {i + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
