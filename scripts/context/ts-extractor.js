import { Project } from 'ts-morph';
import { resolve, join } from 'node:path';
import { existsSync } from 'node:fs';

export function createProject(packageDir) {
  const tsConfigPath = join(packageDir, 'tsconfig.json');
  const hasTsConfig = existsSync(tsConfigPath);
  if (!hasTsConfig) {
    console.warn(`Warning: No tsconfig.json found at ${tsConfigPath} — using default compiler options`);
  }
  const project = new Project({
    tsConfigFilePath: hasTsConfig ? tsConfigPath : undefined,
    skipAddingFilesFromTsConfig: true,
  });
  return project;
}

export function validateTermAgainstSource(term, project, packageDir) {
  const errors = [];
  const warnings = [];

  if (!term.sourceFile || !term.sourceName) {
    return { errors, warnings };
  }

  const { sourceFile: relPath, sourceName } = term;

  const absPath = resolve(packageDir, relPath);
  if (!existsSync(absPath)) {
    errors.push({ message: `Source file not found: ${relPath}`, check: 'file-exists' });
    return { errors, warnings };
  }

  const sf = project.addSourceFileAtPathIfExists(absPath) ?? project.getSourceFile(absPath);
  if (!sf) {
    errors.push({ message: `Could not add source file: ${relPath}`, check: 'file-exists' });
    return { errors, warnings };
  }

  const symbol = findSymbol(sf, sourceName);
  if (!symbol) {
    errors.push({ message: `Symbol "${sourceName}" not found in ${relPath}`, check: 'symbol-exists' });
    return { errors, warnings };
  }

  try {
    if (term.params || term.fields) {
      validateProperties(symbol, term, errors, warnings);
    }

    if (term.values) {
      validateEnumValues(symbol, term, errors, warnings);
    }
  } catch (e) {
    errors.push({ message: `Type analysis error for "${sourceName}" in ${relPath}: ${e.message}`, check: 'ts-morph' });
  }

  return { errors, warnings };
}

function findSymbol(sf, sourceName) {
  const dotIdx = sourceName.indexOf('.');
  if (dotIdx !== -1) {
    const className = sourceName.slice(0, dotIdx);
    const memberName = sourceName.slice(dotIdx + 1);
    const cls = sf.getClass(className);
    if (!cls) return null;
    return cls.getMethod(memberName) ?? cls.getProperty(memberName) ?? null;
  }

  return (
    sf.getTypeAlias(sourceName) ??
    sf.getInterface(sourceName) ??
    sf.getFunction(sourceName) ??
    sf.getVariableDeclaration(sourceName) ??
    null
  );
}

function validateProperties(symbol, term, errors, warnings) {
  const type = symbol.getType();
  const sourceProps = type.getProperties();
  const sourcePropNames = new Set(sourceProps.map(p => p.getName()));

  const glossaryEntries = term.params ?? term.fields ?? [];
  const glossaryNames = new Set(glossaryEntries.map(e => e.name));

  for (const entry of glossaryEntries) {
    if (!sourcePropNames.has(entry.name)) {
      errors.push({ message: `glossary param "${entry.name}" not found in source type`, check: 'param-exists' });
      continue;
    }

    if (entry.required !== undefined) {
      const sourceProp = sourceProps.find(p => p.getName() === entry.name);
      const declarations = sourceProp.getDeclarations();
      const isSourceOptional = declarations.some(d => d.hasQuestionToken?.() ?? false);

      if (entry.required && isSourceOptional) {
        warnings.push({ message: `"${entry.name}" is required in glossary but optional in source`, check: 'param-optionality' });
      } else if (!entry.required && !isSourceOptional) {
        warnings.push({ message: `"${entry.name}" is optional in glossary but required in source`, check: 'param-optionality' });
      }
    }
  }

  for (const prop of sourceProps) {
    const name = prop.getName();
    if (!glossaryNames.has(name)) {
      warnings.push({ message: `source has property "${name}" not listed in glossary`, check: 'missing-member' });
    }
  }
}

function validateEnumValues(symbol, term, errors, warnings) {
  const type = symbol.getType();
  const sourceLiterals = type.isUnion()
    ? type.getUnionTypes().filter(t => t.isStringLiteral()).map(t => t.getLiteralValue())
    : [];

  const glossaryValues = new Set(term.values.map(v => v.value));
  const sourceValues = new Set(sourceLiterals);

  for (const val of glossaryValues) {
    if (!sourceValues.has(val)) {
      errors.push({ message: `glossary value "${val}" not found in source union`, check: 'value-exists' });
    }
  }

  for (const val of sourceValues) {
    if (!glossaryValues.has(val)) {
      warnings.push({ message: `source has value "${val}" not listed in glossary`, check: 'missing-value' });
    }
  }
}
