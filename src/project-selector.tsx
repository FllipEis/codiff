import type { ProjectList } from './types.ts';

const compactPath = (path: string) => {
  const homePath = path
    .replace(/^\/Users\/[^/]+(?=\/|$)/, '~')
    .replace(/^\/home\/[^/]+(?=\/|$)/, '~');
  const parts = homePath.split('/').filter(Boolean);

  if (parts.length <= 2) {
    return homePath;
  }

  const prefix = homePath.startsWith('/') ? '/' : '';
  const [first, ...rest] = parts;
  const last = rest.pop();
  const middle = rest.map((part) => part[0]).join('/');

  return `${prefix}${first}/${middle ? `${middle}/` : ''}${last}`;
};

const projectLabel = (path: string) => path.split('/').filter(Boolean).at(-1) ?? compactPath(path);

export function ProjectSelector({
  activeRoot,
  onOpenProject,
  onSelectProject,
  projects,
}: {
  activeRoot: string;
  onOpenProject: () => void;
  onSelectProject: (root: string) => void;
  projects: ProjectList | null;
}) {
  const entries = projects?.entries ?? [{ label: projectLabel(activeRoot), root: activeRoot }];

  return (
    <div className="sidebar-path-row">
      <select
        aria-label="Selected repository"
        className="sidebar-project-select"
        onChange={(event) => onSelectProject(event.currentTarget.value)}
        title={activeRoot}
        value={projects?.activeRoot ?? activeRoot}
      >
        {entries.map((project) => (
          <option key={project.root} value={project.root}>
            {project.label}
          </option>
        ))}
      </select>
      <button
        aria-label="Open repository"
        className="sidebar-open-button"
        onClick={onOpenProject}
        title="Open repository"
        type="button"
      >
        +
      </button>
    </div>
  );
}
