import { useEffect, useState } from 'react';
import { useAccessControl } from '../../context/AccessControlContext';
import { useLabels } from '../../context/LabelsContext';
import { adminService } from '../../services/adminService';
import type { AccessPermissionGroup, AccessPermissionCatalogItem, AccessScreenCatalog } from '../../types/admin';
import { AdminButton } from '../../components/admin/AdminButton';
import { AdminModal } from '../../components/admin/AdminModal';
import { PlusIcon, GroupIcon, FolderIcon, ChevronDownIcon, TrashIcon, AlertIcon } from '../../icons';

export const AdminControlPanelPage = () => {
  const { can } = useAccessControl();
  const { t } = useLabels();

  // Groups state
  const [groups, setGroups] = useState<AccessPermissionGroup[]>([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupCodigo, setGroupCodigo] = useState('');
  const [groupNome, setGroupNome] = useState('');
  const [groupDescricao, setGroupDescricao] = useState('');
  const [isGroupLoading, setIsGroupLoading] = useState(false);
  const [groupError, setGroupError] = useState('');

  // Screens state
  const [isScreenModalOpen, setIsScreenModalOpen] = useState(false);
  const [screenGrupoCodigo, setScreenGrupoCodigo] = useState('');
  const [screenCodigo, setScreenCodigo] = useState('');
  const [screenNome, setScreenNome] = useState('');
  const [screenDescricao, setScreenDescricao] = useState('');
  const [isScreenLoading, setIsScreenLoading] = useState(false);
  const [screenError, setScreenError] = useState('');

  // General state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'group' | 'screen';
    codigo: string;
    nome: string;
    hasAssociations: boolean;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load catalog
  const loadCatalog = async () => {
    setLoading(true);
    setError('');
    try {
      const catalog = await adminService.listarCatalogoAcessos();
      setGroups(catalog.grupos ?? []);
      if (screenGrupoCodigo === '' && (catalog.grupos ?? []).length > 0) {
        setScreenGrupoCodigo((catalog.grupos ?? [])[0].grupoCodigo);
      }
    } catch {
      setError(t('access_control.error_fetch'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCatalog();
  }, [t]);

  // Group modal handlers
  const openGroupModal = () => {
    setGroupCodigo('');
    setGroupNome('');
    setGroupDescricao('');
    setGroupError('');
    setIsGroupModalOpen(true);
  };

  const closeGroupModal = () => {
    setIsGroupModalOpen(false);
    setGroupError('');
  };

  const handleCreateGroup = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!can('INCLUIR')) {
      setGroupError(t('access_control.action_denied'));
      return;
    }

    if (!groupCodigo.trim() || !groupNome.trim()) {
      setGroupError(t('access_control.error_save'));
      return;
    }

    setIsGroupLoading(true);
    setGroupError('');

    try {
      await adminService.criarGrupoAcessos({
        codigoGrupo: groupCodigo,
        nomeGrupo: groupNome,
        descricao: groupDescricao,
      });

      setGroupCodigo('');
      setGroupNome('');
      setGroupDescricao('');
      setIsGroupModalOpen(false);
      setSuccessMessage('Grupo criado com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadCatalog();
    } catch {
      setGroupError(t('access_control.error_save'));
    } finally {
      setIsGroupLoading(false);
    }
  };

  // Screen modal handlers
  const openScreenModal = () => {
    if (groups.length === 0) {
      setScreenError('Crie um grupo primeiro!');
      return;
    }
    setScreenCodigo('');
    setScreenNome('');
    setScreenDescricao('');
    setScreenError('');
    setIsScreenModalOpen(true);
  };

  const closeScreenModal = () => {
    setIsScreenModalOpen(false);
    setScreenError('');
  };

  const handleCreateScreen = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!can('INCLUIR')) {
      setScreenError(t('access_control.action_denied'));
      return;
    }

    if (!screenGrupoCodigo.trim() || !screenCodigo.trim() || !screenNome.trim()) {
      setScreenError(t('access_control.error_save'));
      return;
    }

    setIsScreenLoading(true);
    setScreenError('');

    try {
      await adminService.criarTelaAcessos({
        codigoGrupo: screenGrupoCodigo,
        telaCodigo: screenCodigo,
        telaNome: screenNome,
        descricao: screenDescricao,
      });

      setScreenCodigo('');
      setScreenNome('');
      setScreenDescricao('');
      setIsScreenModalOpen(false);
      setSuccessMessage('Tela criada com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadCatalog();
    } catch {
      setScreenError(t('access_control.error_save'));
    } finally {
      setIsScreenLoading(false);
    }
  };

  // Delete group
  const openDeleteGroupConfirmation = (group: AccessPermissionGroup) => {
    const isAdminGroup = group.grupoCodigo === 'ADMIN';
    const hasAssociations = (group.telas?.length ?? 0) > 0;

    if (isAdminGroup) {
      setError('Não é possível excluir o grupo de Administração');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (hasAssociations) {
      setError('Não é possível excluir um grupo que possui telas associadas. Remova as telas primeiro.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setDeleteConfirmation({
      type: 'group',
      codigo: group.grupoCodigo,
      nome: group.grupoNome,
      hasAssociations,
    });
  };

  const handleDeleteGroup = async () => {
    if (!deleteConfirmation?.codigo || deleteConfirmation.type !== 'group' || !can('EXCLUIR')) {
      return;
    }

    setIsDeleting(true);
    try {
      await adminService.deletarGrupoAcessos(deleteConfirmation.codigo);
      setSuccessMessage('Grupo excluído com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setDeleteConfirmation(null);
      await loadCatalog();
    } catch {
      setError('Erro ao excluir grupo. Tente novamente.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete screen
  const openDeleteScreenConfirmation = (tela: AccessScreenCatalog) => {
    const isAdminGroup = tela.grupoCodigo === 'ADMIN';

    if (isAdminGroup) {
      setError('Não é possível excluir telas do grupo de Administração');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setDeleteConfirmation({
      type: 'screen',
      codigo: tela.telaCodigo,
      nome: tela.telaNome,
      hasAssociations: false,
    });
  };

  const handleDeleteScreen = async () => {
    if (!deleteConfirmation?.codigo || deleteConfirmation.type !== 'screen' || !can('EXCLUIR')) {
      return;
    }

    setIsDeleting(true);
    try {
      await adminService.deletarTelaAcessos(deleteConfirmation.codigo);
      setSuccessMessage('Tela excluída com sucesso! As associações com perfis e usuários foram removidas.');
      setTimeout(() => setSuccessMessage(''), 3000);
      setDeleteConfirmation(null);
      await loadCatalog();
    } catch {
      setError('Erro ao excluir tela. Tente novamente.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderPermissionBadges = (permissoes?: AccessPermissionCatalogItem[]) => {
    if (!permissoes || permissoes.length === 0) return null;
    return (
      <div className="mt-2 flex flex-wrap gap-1">
        {permissoes.map((permissao, pIndex) => (
          <span
            key={`${permissao.acaoCodigo}-${pIndex}`}
            className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
          >
            {permissao.acaoCodigo}
          </span>
        ))}
      </div>
    );
  };

  const renderScreenItem = (tela: AccessScreenCatalog, index: number) => {
    const isAdminGroup = tela.grupoCodigo === 'ADMIN';
    const canDeleteScreen = !isAdminGroup && can('EXCLUIR');

    return (
      <li
        key={`${tela.telaCodigo}-${index}`}
        className="p-4 hover:bg-gray-100 transition-colors flex items-start justify-between gap-3"
      >
        <div className="flex items-start gap-3 flex-1">
          <FolderIcon className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm text-gray-900">{tela.telaNome}</p>
            <p className="mt-0.5 text-xs font-mono text-gray-500">{tela.telaCodigo}</p>
            {renderPermissionBadges(tela.permissoes)}
          </div>
        </div>
        {canDeleteScreen && (
          <button
            onClick={() => openDeleteScreenConfirmation(tela)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
            title="Excluir tela"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </li>
    );
  };

  const renderScreensList = (telas?: AccessScreenCatalog[]) => {
    if (!telas || telas.length === 0) {
      return (
        <div className="p-4 text-center text-sm text-gray-500">
          Nenhuma tela associada a este grupo
        </div>
      );
    }
    return (
      <ul className="divide-y divide-gray-200">
        {telas.map((tela, index) => renderScreenItem(tela, index))}
      </ul>
    );
  };

  const renderGroupCard = (group: AccessPermissionGroup) => {
    const isExpanded = expandedGroup === group.grupoCodigo;
    const isAdminGroup = group.grupoCodigo === 'ADMIN';
    const hasAssociations = (group.telas?.length ?? 0) > 0;
    const canDeleteGroup = !isAdminGroup && !hasAssociations && can('EXCLUIR');

    return (
      <div
        key={group.grupoCodigo}
        className="rounded-lg border border-gray-200 bg-white overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all"
      >
        {/* Group Header - Clickable */}
        <div className="w-full p-4 flex items-start justify-between gap-3 hover:bg-gray-50 transition-colors">
          <button
            onClick={() => setExpandedGroup(isExpanded ? null : group.grupoCodigo)}
            className="flex-1 text-left flex items-start justify-between gap-3"
          >
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{group.grupoNome}</p>
              <p className="mt-1 text-xs font-mono text-gray-500">{group.grupoCodigo}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {group.telas?.length ?? 0}
              </span>
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-400 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {/* Delete button - only for non-admin groups without screens */}
          {canDeleteGroup && (
            <button
              onClick={() => openDeleteGroupConfirmation(group)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Excluir grupo"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Description - always visible */}
        {group.descricao && (
          <div className="px-4 text-xs text-gray-600 bg-gray-50 border-t border-gray-200 py-2">
            {group.descricao}
          </div>
        )}

        {/* Screens List - Expandable */}
        {isExpanded && (
          <div className="border-t border-gray-200 bg-gray-50">
            {renderScreensList(group.telas)}
          </div>
        )}
      </div>
    );
  };

  const renderCatalogList = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      );
    }

    if (groups.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <p className="text-gray-600">{t('access_control.catalog_empty')}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {groups.map((group) => renderGroupCard(group))}
      </div>
    );
  };

  const renderContent = () => {
    return (
      <>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('layout.control_panel')}</h1>
          <p className="mt-2 text-gray-600">Gerencie o catálogo de permissões do sistema</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('access_control.catalog_title')}</h2>
              <p className="mt-1 text-sm text-gray-600">Grupos: {groups.length}</p>
            </div>

            {can('INCLUIR') && (
              <div className="flex gap-3">
                <AdminButton
                  onClick={openGroupModal}
                  icon={<GroupIcon className="h-4 w-4" />}
                >
                  {t('access_control.group_create_button')}
                </AdminButton>
                <AdminButton
                  onClick={openScreenModal}
                  icon={<FolderIcon className="h-4 w-4" />}
                >
                  {t('access_control.screen_create_button')}
                </AdminButton>
              </div>
            )}
          </div>

          {renderCatalogList()}
        </div>

        {/* Group Modal */}
        <AdminModal
          isOpen={isGroupModalOpen}
          title={t('access_control.group_create_button')}
          onClose={closeGroupModal}
          isLoading={isGroupLoading}
          error={groupError}
        >
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label htmlFor="group-code" className="ds-label">{t('access_control.group_code_label')}</label>
              <input
                id="group-code"
                type="text"
                value={groupCodigo}
                onChange={(e) => setGroupCodigo(e.target.value)}
                required
                disabled={isGroupLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Ex: ADMIN"
              />
            </div>

            <div>
              <label htmlFor="group-name" className="ds-label">{t('access_control.group_name_label')}</label>
              <input
                id="group-name"
                type="text"
                value={groupNome}
                onChange={(e) => setGroupNome(e.target.value)}
                required
                disabled={isGroupLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Ex: Administração"
              />
            </div>

            <div>
              <label htmlFor="group-desc" className="ds-label">{t('access_control.group_description_label')}</label>
              <textarea
                id="group-desc"
                value={groupDescricao}
                onChange={(e) => setGroupDescricao(e.target.value)}
                disabled={isGroupLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                rows={3}
                placeholder={t('access_control.description_placeholder')}
              />
            </div>

            <AdminButton type="submit" isLoading={isGroupLoading} disabled={!can('INCLUIR')} icon={<PlusIcon className="h-4 w-4" />} className="w-full">
              {isGroupLoading ? 'Criando...' : t('access_control.group_create_button')}
            </AdminButton>
          </form>
        </AdminModal>

        {/* Screen Modal */}
        <AdminModal
          isOpen={isScreenModalOpen}
          title={t('access_control.screen_create_button')}
          onClose={closeScreenModal}
          isLoading={isScreenLoading}
          error={screenError}
        >
          <form onSubmit={handleCreateScreen} className="space-y-4">
            <div>
              <label htmlFor="screen-group" className="ds-label">{t('access_control.screen_group_label')}</label>
              <select
                id="screen-group"
                value={screenGrupoCodigo}
                onChange={(e) => setScreenGrupoCodigo(e.target.value)}
                required
                disabled={isScreenLoading}
                className="ds-select disabled:cursor-not-allowed disabled:opacity-60"
              >
                {groups.map((group) => (
                  <option key={group.grupoCodigo} value={group.grupoCodigo}>
                    {group.grupoNome} ({group.grupoCodigo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="screen-code" className="ds-label">{t('access_control.screen_code_label')}</label>
              <input
                id="screen-code"
                type="text"
                value={screenCodigo}
                onChange={(e) => setScreenCodigo(e.target.value)}
                required
                disabled={isScreenLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Ex: ADMIN_USERS"
              />
            </div>

            <div>
              <label htmlFor="screen-name" className="ds-label">{t('access_control.screen_name_label')}</label>
              <input
                id="screen-name"
                type="text"
                value={screenNome}
                onChange={(e) => setScreenNome(e.target.value)}
                required
                disabled={isScreenLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Ex: Usuários Administrativos"
              />
            </div>

            <div>
              <label htmlFor="screen-desc" className="ds-label">{t('access_control.screen_description_label')}</label>
              <textarea
                id="screen-desc"
                value={screenDescricao}
                onChange={(e) => setScreenDescricao(e.target.value)}
                disabled={isScreenLoading}
                className="ds-input disabled:cursor-not-allowed disabled:opacity-60"
                rows={3}
                placeholder={t('access_control.description_placeholder')}
              />
            </div>

            <AdminButton type="submit" isLoading={isScreenLoading} disabled={!can('INCLUIR')} icon={<PlusIcon className="h-4 w-4" />} className="w-full">
              {isScreenLoading ? 'Criando...' : t('access_control.screen_create_button')}
            </AdminButton>
          </form>
        </AdminModal>

        {/* Delete Confirmation Modal */}
        <AdminModal
          isOpen={deleteConfirmation !== null}
          title="Confirmar Exclusão"
          onClose={() => setDeleteConfirmation(null)}
          isLoading={isDeleting}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-red-50 rounded-lg">
                <AlertIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Você tem certeza que deseja excluir {deleteConfirmation?.type === 'group' ? 'este grupo' : 'esta tela'}?
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {deleteConfirmation?.type === 'group' 
                    ? `Grupo: ${deleteConfirmation?.nome}`
                    : `Tela: ${deleteConfirmation?.nome} - As associações com perfis e usuários serão removidas.`
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmation(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteConfirmation?.type === 'group' ? handleDeleteGroup() : handleDeleteScreen()}
                disabled={isDeleting}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </AdminModal>
      </>
    );
  };

  const renderAccessDenied = () => {
    return (
      <>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('layout.control_panel')}</h1>
          <p className="mt-2 text-gray-600">Gerencie o catálogo de permissões do sistema</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{t('access_control.denied_description')}</p>
        </div>
      </>
    );
  };

  return (
    <section className="space-y-8">
      {can('CONSULTAR') ? renderContent() : renderAccessDenied()}
    </section>
  );
};
