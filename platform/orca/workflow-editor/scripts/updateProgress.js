#!/usr/bin/env node

/**
 * Update progress.json with test results and git information
 * Usage: node updateProgress.js --phase=2 --tests-passed=20 --tests-failed=0 --coverage=92.5
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Parse arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  if (typeof arg !== 'string') return acc
  const [key, value] = arg.split('=')
  if (key) acc[key.replace('--', '')] = value
  return acc
}, {})

const phase = parseInt(args.phase || '2')
const testsPassed = parseInt(args['tests-passed'] || '0')
const testsFailed = parseInt(args['tests-failed'] || '0')
const coverage = parseFloat(args.coverage || '0')
const gitHash = getGitInfo('hash')
const gitBranch = getGitInfo('branch')

console.log('📊 Updating progress...')
console.log(`   Phase: ${phase}`)
console.log(`   Tests Passed: ${testsPassed}`)
console.log(`   Tests Failed: ${testsFailed}`)
console.log(`   Coverage: ${coverage}%`)
console.log(`   Git: ${gitHash} (${gitBranch})`)
console.log('')

try {
  // Read progress file
  const progressFile = path.join(__dirname, '..', 'progress.json')
  const progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'))

  // Find phase
  const phaseIndex = progress.phases.findIndex(p => p.id === phase)
  if (phaseIndex < 0) {
    console.error(`❌ Phase ${phase} not found in progress.json`)
    process.exit(1)
  }

  const currentPhase = progress.phases[phaseIndex]

  // Calculate completed tasks
  const completedTasks = currentPhase.tasks.filter(t => t.status === 'COMPLETED').length
  const totalTasks = currentPhase.tasks.length
  const phaseProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  // Update phase progress
  currentPhase.progress = Math.round(phaseProgress)
  currentPhase.lastUpdate = new Date().toISOString()

  // Add/update test results
  if (!currentPhase.testResults) {
    currentPhase.testResults = {}
  }

  currentPhase.testResults.timestamp = new Date().toISOString()
  currentPhase.testResults.passed = testsPassed
  currentPhase.testResults.failed = testsFailed
  currentPhase.testResults.coverage = coverage
  currentPhase.testResults.gitHash = gitHash
  currentPhase.testResults.gitBranch = gitBranch

  // Update global metrics
  const allPhases = progress.phases.filter(p => p.status === 'COMPLETED')
  const allTestsPassed = allPhases.reduce((sum, p) => sum + (p.testResults?.passed || 0), 0) + testsPassed
  const allTestsFailed = allPhases.reduce((sum, p) => sum + (p.testResults?.failed || 0), 0) + testsFailed

  progress.metrics = {
    ...progress.metrics,
    testsPassed: allTestsPassed,
    testsFailed: allTestsFailed,
    testCoverage: coverage,
    lastUpdateTime: new Date().toISOString(),
    lastGitHash: gitHash,
    lastGitBranch: gitBranch,
  }

  // Write updated progress
  fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2))

  console.log('✅ Progress updated successfully!')
  console.log('')
  console.log('Summary:')
  console.log(`  Phase ${phase}: ${currentPhase.progress}% complete`)
  console.log(`  Tests: ${testsPassed} passed, ${testsFailed} failed`)
  console.log(`  Coverage: ${coverage}%`)
  console.log('')

} catch (error) {
  console.error('❌ Error updating progress:')
  console.error(error.message)
  process.exit(1)
}

/**
 * Get git information
 */
function getGitInfo(type) {
  try {
    if (type === 'hash') {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().slice(0, 7)
    } else if (type === 'branch') {
      return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
    }
  } catch (error) {
    console.warn(`⚠️  Could not get git ${type}`)
    return 'unknown'
  }
}
