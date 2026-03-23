import { Link } from 'react-router-dom';

const cards = [
  {
    title: 'Usuarios Administrativos',
    text: 'Crie administradores, vincule roles e inative contas com rastreabilidade.',
    to: '/admin/users',
    tone: 'border-sky-200 bg-sky-50/60 text-sky-700',
  },
  {
    title: 'Roles e Permissoes',
    text: 'Gerencie papeis e niveis de permissao para cada modulo.',
    to: '/admin/roles',
    tone: 'border-violet-200 bg-violet-50/60 text-violet-700',
  },
  {
    title: 'Configuracoes do Sistema',
    text: 'Controle chaves operacionais e parametros do backend.',
    to: '/admin/configs',
    tone: 'border-amber-200 bg-amber-50/60 text-amber-700',
  },
  {
    title: 'Listas de Acesso',
    text: 'Mantenha whitelist/blacklist por IP, email ou dominio.',
    to: '/admin/access-lists',
    tone: 'border-emerald-200 bg-emerald-50/60 text-emerald-700',
  },
  {
    title: 'Logs de Acesso',
    text: 'Audite requisicoes e status HTTP em tempo real.',
    to: '/admin/logs',
    tone: 'border-indigo-200 bg-indigo-50/60 text-indigo-700',
  },
];

export const DashboardPage = () => {
  return (
    <section className="ds-page">
      <div className="ds-card bg-gradient-to-r from-white to-warm-50">
        <p className="text-xs font-semibold uppercase tracking-widest text-burnt">Painel Administrativo</p>
        <h1 className="ds-page-title mt-2">
          Centro de Controle Schemusic
        </h1>
        <p className="ds-page-subtitle mt-2 max-w-3xl">
          Gerencie acesso, configuracoes criticas e auditoria operacional em um unico painel.
          A navegacao foi organizada para reduzir cliques e acelerar tarefas recorrentes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="ds-kpi">
          <p className="ds-kpi-label">Usuarios</p>
          <p className="ds-kpi-value">--</p>
          <p className="ds-kpi-desc">Contas administrativas</p>
        </div>
        <div className="ds-kpi">
          <p className="ds-kpi-label">Roles</p>
          <p className="ds-kpi-value">--</p>
          <p className="ds-kpi-desc">Perfis de permissao</p>
        </div>
        <div className="ds-kpi">
          <p className="ds-kpi-label">Listas</p>
          <p className="ds-kpi-value">--</p>
          <p className="ds-kpi-desc">Regras de acesso</p>
        </div>
        <div className="ds-kpi">
          <p className="ds-kpi-label">Logs</p>
          <p className="ds-kpi-value">--</p>
          <p className="ds-kpi-desc">Eventos recentes</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className={`group rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.tone}`}
          >
            <div className="space-y-3">
              <h2 className="font-title text-xl font-bold">{card.title}</h2>
              <p className="text-sm leading-relaxed opacity-90">{card.text}</p>
              <p className="pt-2 text-xs font-semibold uppercase tracking-wide">Acessar modulo</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
