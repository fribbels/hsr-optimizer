import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { IconCheck, IconGripVertical, IconPlus, IconTrash, IconX } from '@tabler/icons-react'
import { ActionIcon, Badge, Button, Divider, Flex, NumberInput, Paper, SegmentedControl, Select, Table, Title as MantineTitle, Tooltip } from '@mantine/core'
import { useForm } from '@mantine/form'
import type { UseFormReturnType } from '@mantine/form'
import chroma from 'chroma-js'
import i18next from 'i18next'
import { DEFAULT_CONFIG } from 'lib/characterPreview/color/colorPipelineConfig'
import { oklchCharacterListColor } from 'lib/characterPreview/color/colorUtilsOklch'
import { getCharacterConfig } from 'lib/conditionals/resolver/characterConfigRegistry'
import { Assets } from 'lib/rendering/assets'
import { SaveState } from 'lib/state/saveState'
import { getCharacterById, getCharacters } from 'lib/stores/character/characterStore'
import { precomputedCssVars } from 'lib/tabs/tabCharacters/characterGridPresets'
import { useWarpCalculatorStore } from 'lib/tabs/tabWarp/useWarpCalculatorStore'
import { BannerRotation, calculateWarps, DEFAULT_WARP_REQUEST, EidolonLevel, type EnrichedWarpRequest, StarlightMultiplier, StarlightRefund, SuperimpositionLevel, normalizeWarpTargets, WarpIncomeOptions, WarpIncomeType, type WarpMilestoneResult, type WarpRequest, WarpStrategy, type WarpTarget, type WarpTargetResult } from 'lib/tabs/tabWarp/warpCalculatorController'
import { ColorizedTitleWithInfo } from 'lib/ui/ColorizedLink'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { MultiSelectPills } from 'lib/ui/MultiSelectPills'
import { CharacterSelect } from 'lib/ui/selectors/CharacterSelect'
import { localeNumber, localeNumber_0, localeNumberComma } from 'lib/utils/i18nUtils'
import { showImageOnLoad } from 'lib/utils/frontendUtils'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { Fragment, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { scannerChannel, useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import classes from './WarpCalculatorTab.module.css'
import characterClasses from 'lib/tabs/tabCharacters/CharacterGrid.module.css'
import { precisionRound } from 'lib/utils/mathUtils'
import type { LightConeId } from 'types/lightCone'

const HEADER_LABEL_GAP = 4
const warpChanceColorScale = chroma.scale(['#df524bcc', '#efe959cc', '#89d86dcc']).domain([0, 0.33, 1])
const defaultTargetCssVars = {
  ...precomputedCssVars.default,
  '--cr-row-height': '114px',
  '--cr-portrait-scale': '35%',
  '--cr-lc-size': '100px',
  '--cr-lc-right-pad': '46px',
  '--cr-lc-strip-width': '166px',
} as CSSProperties

export function WarpCalculatorTab() {
  const { t } = useTranslation('warpCalculatorTab')

  return (
    <Flex direction="column" style={{ maxWidth: 950, width: '100%' }} align='center' gap="xl">
      <ColorizedTitleWithInfo
        text={t('SectionTitles.Planner')/* Warp Planner */}
        url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/warp-planner.md'
      />

      <WarpPlanner/>
    </Flex>
  )
}

function sanitizeWarpRequest(warpRequest: WarpRequest) {
  if (!warpRequest) return { ...DEFAULT_WARP_REQUEST }

  const hasStoredTargets = Array.isArray(warpRequest.targets) && warpRequest.targets.length > 0

  // Spread produces a new object — safe from mutating store state
  const sanitized = { ...DEFAULT_WARP_REQUEST, ...warpRequest }

  // Filter to only valid IDs instead of clearing all selections
  if (!Array.isArray(sanitized.income)) {
    sanitized.income = []
  } else {
    sanitized.income = sanitized.income.filter((incomeId) =>
      WarpIncomeOptions.some((option) => option.id === incomeId),
    )
  }

  sanitized.targets = normalizeWarpTargets(hasStoredTargets ? sanitized : { ...sanitized, targets: [] })
  sanitized.bannerRotation = BannerRotation.NEW
  sanitized.currentEidolonLevel = EidolonLevel.NONE
  sanitized.currentSuperimpositionLevel = SuperimpositionLevel.NONE

  return sanitized
}

function WarpPlanner() {
  const { t } = useTranslation('warpCalculatorTab', { keyPrefix: 'SectionTitles' })
  const storedWarpRequest = useWarpCalculatorStore((s) => s.request)

  const warpRequest = sanitizeWarpRequest(storedWarpRequest)

  const form = useForm<WarpRequest>({
    initialValues: warpRequest,
    onValuesChange: (values) => {
      useWarpCalculatorStore.getState().setRequest(values)
      SaveState.delayedSave(10_000)
    },
  })

  scannerChannel.use((event) => {
    const ingestWarpResources = useScannerState.getState().ingestWarpResources
    if (!ingestWarpResources) return

    switch (event.event) {
      case "UpdateGachaFunds":
        form.setFieldValue("jades", event.data.stellar_jade + event.data.oneric_shards)
        break

      case "UpdateMaterials":
        const state = useScannerState.getState()
        const specialPasses = state.materials["102"] ?? { count: 0 }
        const undyingStarlight = state.materials["252"] ?? { count: 0 }

        form.setFieldValue("passes", specialPasses.count + Math.floor(undyingStarlight.count / 20))
        break

      case "GachaResult":
        const gachaResult = event.data
        const pityUpdate = gachaResult.pity_5

        if (gachaResult.banner_type === "Character") {
          if (pityUpdate.kind === "ResetPity") {
            form.setFieldValue("pityCharacter", pityUpdate.amount)
            form.setFieldValue("guaranteedCharacter", pityUpdate.set_guarantee)
          } else if (pityUpdate.kind === "AddPity") {
            const currentPity = form.getValues().pityCharacter
            form.setFieldValue("pityCharacter", currentPity + gachaResult.pity_5.amount)
          }

        } else if (gachaResult.banner_type === "LightCone") {
          if (pityUpdate.kind === "ResetPity") {
            form.setFieldValue("pityLightCone", pityUpdate.amount)
            form.setFieldValue("guaranteedLightCone", pityUpdate.set_guarantee)
          } else if (pityUpdate.kind === "AddPity") {
            const currentPity = form.getValues().pityLightCone
            form.setFieldValue("pityLightCone", currentPity + gachaResult.pity_5.amount)
          }
        }
    }
  }, [form])

  const warpResult = calculateWarps(form.getValues())
  const targetIds = warpResult.targetResults.map((targetResult) => targetResult.target.id)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  function handleTargetDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    moveTarget(form, String(active.id), String(over.id))
  }

  return (
    <div className={classes.plannerShell}>
      <Paper style={{ width: '100%' }} p="xl" pb={8} withBorder>
        <Flex style={{ marginBottom: 30 }}>
          <Flex direction="column" flex={1}>
            <Title>
              <Flex justify='center' gap={10}>
                {t('Settings')/* Settings */}
              </Flex>
            </Title>

            <Flex direction="column" gap={16}>
              <Flex gap={20}>
                <Flex align='flex-end' gap={8} flex={1}>
                  <Flex direction="column" gap={HEADER_LABEL_GAP}>
                    <HeaderText>{t('Jades')/* Jades */}</HeaderText>
                    <NumberInput
                      placeholder='0'
                      min={0}
                      style={{ width: '100%' }}
                      hideControls
                      leftSection={
                        <Flex align='center' justify='center' w='100%' h='60%' pl={2} style={{ borderRight: '1px solid #444' }}>
                          <img src={Assets.getJade()} style={{ height: 24 }}/>
                        </Flex>
                      }
                      leftSectionWidth={34}
                      leftSectionPointerEvents='none'
                      styles={{ input: { paddingLeft: 42 } }}
                      {...form.getInputProps('jades')}
                    />
                  </Flex>
                </Flex>

                <Flex direction="column" flex={1} gap={HEADER_LABEL_GAP}>
                  <HeaderText>{t('DefaultStrategy')/* Default Strategy */}</HeaderText>
                  <Select
                    data={generateStrategyOptions()}
                    value={String(form.getValues().strategy)}
                    styles={{ input: { height: 30, minHeight: 30 } }}
                    onChange={(val) => {
                      if (val != null) form.setFieldValue('strategy', Number(val) as WarpStrategy)
                    }}
                  />
                </Flex>
              </Flex>

              <Flex gap={20}>
                <Flex align='flex-end' gap={8} flex={1}>
                  <Flex direction="column" gap={HEADER_LABEL_GAP}>
                    <HeaderText>{t('Passes')/* Passes */}</HeaderText>
                    <NumberInput
                      placeholder='0'
                      min={0}
                      style={{ width: '100%' }}
                      hideControls
                      leftSection={
                        <Flex align='center' justify='center' w='100%' h='60%' pl={2} style={{ borderRight: '1px solid #444' }}>
                          <img src={Assets.getPass()} style={{ height: 24 }}/>
                        </Flex>
                      }
                      leftSectionWidth={34}
                      leftSectionPointerEvents='none'
                      styles={{ input: { paddingLeft: 42 } }}
                      {...form.getInputProps('passes')}
                    />
                  </Flex>
                </Flex>

                <Flex direction="column" flex={1} gap={HEADER_LABEL_GAP}>
                  <HeaderText>{t('Starlight')/* Starlight */}</HeaderText>

                  <Select
                    leftSection={
                      <Flex align='center' justify='center' w='100%' h='60%' pl={2} style={{ borderRight: '1px solid #444' }}>
                        <img src={Assets.getStarlight()} style={{ height: 24 }}/>
                      </Flex>
                    }
                    leftSectionWidth={34}
                    leftSectionPointerEvents='none'
                    styles={{ input: { paddingLeft: 42 } }}
                    data={generateStarlightOptions()}
                    comboboxProps={{ keepMounted: false, width: 'fit-content' }}
                    value={form.getValues().starlight}
                    onChange={(val) => {
                      if (val != null) form.setFieldValue('starlight', val as StarlightRefund)
                    }}
                  />
                </Flex>
              </Flex>

              <Flex gap={20}>
                <Flex direction="column" gap={HEADER_LABEL_GAP} style={{ width: 0, flex: 1, overflow: 'hidden' }}>
                  <HeaderText>{t('AdditionalResources')/* Additional resources */}</HeaderText>
                  <MultiSelectPills
                    placeholder='None'
                    clearable
                    size='xs'
                    maxDisplayedValues={0}
                    data={generateIncomeOptions()}
                    dropdownWidth={500}
                    value={form.getValues().income}
                    onChange={(val) => form.setFieldValue('income', val)}
                    renderOption={(option) => (
                      <Flex align='center' gap={4}>
                        <span>{option.label}</span>
                        <img src={Assets.getPass()} style={{ height: 16 }}/>
                      </Flex>
                    )}
                  />
                </Flex>

                <Flex flex={1}/>
              </Flex>
            </Flex>
          </Flex>

          <VerticalDivider width={30}/>

          <Flex direction="column" flex={1} justify='space-between'>
            <Flex direction="column">
              <Title>{t('Character')/* Character */}</Title>
              <PityInputs banner='Character' form={form}/>
            </Flex>

            <Flex direction="column">
              <Title>{t('LightCone')/* Light Cone */}</Title>
              <PityInputs banner='LightCone' form={form}/>
            </Flex>
          </Flex>
        </Flex>

        <WarpSummary enriched={warpResult.request}/>
      </Paper>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleTargetDragEnd}
      >
        <SortableContext
          items={targetIds}
          strategy={verticalListSortingStrategy}
        >
          <Flex direction='column' gap={16} mt={16}>
            {warpResult.targetResults.map((targetResult, index) => (
              <SortableWarpTargetCard
                key={targetResult.target.id}
                form={form}
                index={index}
                targetResult={targetResult}
              />
            ))}
          </Flex>
        </SortableContext>
      </DndContext>

      <Button
        variant='default'
        leftSection={<IconPlus size={16} />}
        mt={16}
        w='100%'
        onClick={() => addTarget(form)}
      >
        {t('AddTarget')/* Add character target */}
      </Button>

      <WarpResultsTable targetResults={warpResult.targetResults} request={warpResult.request}/>
    </div>
  )
}

function Title(props: { children: ReactNode }) {
  return (
    <MantineTitle order={5} style={{ margin: 0, marginBottom: 8, textAlign: 'center' }}>
      {props.children}
    </MantineTitle>
  )
}

function WarpSummary(props: { enriched: EnrichedWarpRequest }) {
  const { enriched } = props

  return (
    <Divider
      mt={40} mb={0}
      label={
        <Flex align='center' gap={4} style={{ fontSize: 16 }}>
          {localeNumberComma(enriched.totalJade)}
          <img style={{ height: 16 }} src={Assets.getJade()}/>
          <span>+</span>
          {localeNumberComma(enriched.passes)}
          <img style={{ height: 16 }} src={Assets.getPass()}/>
          {enriched.additionalPasses > 0 && (
            <>
              <span>+</span>
              {localeNumberComma(enriched.additionalPasses)}
              <img style={{ height: 16 }} src={Assets.getPass()}/>
            </>
          )}
          <span>+</span>
          {localeNumberComma(enriched.totalStarlight)}
          <img style={{ height: 16 }} src={Assets.getStarlight()}/>
          <span>=</span>
          {localeNumberComma(enriched.warps)}
          <img style={{ height: 16 }} src={Assets.getPass()}/>
        </Flex>
      }
      labelPosition='center'
    />
  )
}

function SortableWarpTargetCard(props: {
  form: UseFormReturnType<WarpRequest>,
  index: number,
  targetResult: WarpTargetResult,
}) {
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.targetResult.target.id,
    animateLayoutChanges: () => false,
  })

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transform ? transition : undefined,
    opacity: isDragging ? 0.45 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <WarpTargetCard
        {...props}
        dragHandleRef={setActivatorNodeRef}
        dragHandleProps={{ ...attributes, ...listeners } as HTMLAttributes<HTMLDivElement>}
        isDragging={isDragging}
      />
    </div>
  )
}

function WarpTargetCard(props: {
  form: UseFormReturnType<WarpRequest>,
  index: number,
  targetResult: WarpTargetResult,
  dragHandleRef?: (node: HTMLDivElement | null) => void,
  dragHandleProps?: HTMLAttributes<HTMLDivElement>,
  isDragging?: boolean,
}) {
  const { t } = useTranslation('warpCalculatorTab', { keyPrefix: 'SectionTitles' })
  const { dragHandleProps, dragHandleRef, form, index, isDragging, targetResult } = props
  const target = targetResult.target
  const canRemove = form.getValues().targets.length > 1
  const hasCharacter = target.characterId != null
  const [characterSelectOpen, setCharacterSelectOpen] = useState(false)

  return (
    <Paper className={classes.targetCard} data-dragging={isDragging || undefined} data-empty={!hasCharacter || undefined} data-target-id={target.id} p={0} withBorder>
      {hasCharacter ? (
        <WarpCharacterHeader
          target={target}
          rank={index + 1}
          onClick={() => setCharacterSelectOpen(true)}
          dragHandleRef={dragHandleRef}
          dragHandleProps={dragHandleProps}
        />
      ) : (
        <WarpEmptyTargetHeader
          rank={index + 1}
          dragHandleRef={dragHandleRef}
          dragHandleProps={dragHandleProps}
        />
      )}

      <Tooltip label={t('RemoveTarget')/* Remove target */} disabled={!canRemove}>
        <ActionIcon
          className={classes.targetRemoveButton}
          variant='default'
          size={30}
          disabled={!canRemove}
          aria-label={t('RemoveTarget')}
          onClick={() => removeTarget(form, index)}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Tooltip>

      <Flex className={classes.targetControls} direction='column' gap={12}>
        <Flex gap={12} align='flex-end'>
          <Flex direction='column' gap={HEADER_LABEL_GAP} className={classes.targetControl}>
            <HeaderText>{t('Character')/* Character */}</HeaderText>
            <CharacterSelect
              value={target.characterId}
              onChange={(characterId) => updateTarget(form, index, getCharacterSelectionPatch(characterId))}
              opened={characterSelectOpen}
              onOpenChange={setCharacterSelectOpen}
            />
          </Flex>

          <Flex direction='column' gap={HEADER_LABEL_GAP} className={classes.targetControl}>
            <HeaderText>{t('TargetEidolon')/* Eidolon target */}</HeaderText>
            <Select
              data={generateEidolonLevelOptions()}
              value={String(target.targetEidolonLevel)}
              onChange={(value) => {
                if (value != null) updateTarget(form, index, { targetEidolonLevel: Number(value) as EidolonLevel })
              }}
            />
          </Flex>

          <Flex direction='column' gap={HEADER_LABEL_GAP} className={classes.targetControl}>
            <HeaderText>{t('TargetLightCone')/* Light cone target */}</HeaderText>
            <Select
              data={generateSuperimpositionLevelOptions()}
              value={String(target.targetSuperimpositionLevel)}
              onChange={(value) => {
                if (value != null) updateTarget(form, index, { targetSuperimpositionLevel: Number(value) as SuperimpositionLevel })
              }}
            />
          </Flex>

          <Flex direction='column' gap={HEADER_LABEL_GAP} className={classes.targetControl}>
            <HeaderText>{t('Strategy')/* Strategy */}</HeaderText>
            <Select
              data={generateStrategyOptions()}
              value={String(target.strategy)}
              onChange={(value) => {
                if (value != null) updateTarget(form, index, { strategy: Number(value) as WarpStrategy })
              }}
            />
          </Flex>
        </Flex>

        <Flex gap={12} align='flex-end'>
          <Flex direction='column' gap={HEADER_LABEL_GAP} className={classes.targetControlWide}>
            <HeaderText>{t('CurrentEidolon')/* Current eidolon */}</HeaderText>
            <Select
              data={generateEidolonLevelOptions()}
              value={String(target.currentEidolonLevel)}
              onChange={(value) => {
                if (value != null) updateTarget(form, index, { currentEidolonLevel: Number(value) as EidolonLevel })
              }}
            />
          </Flex>

          <Flex direction='column' gap={HEADER_LABEL_GAP} className={classes.targetControlWide}>
            <HeaderText>{t('CurrentSuperimposition')/* Current superimposition */}</HeaderText>
            <Select
              data={generateSuperimpositionLevelOptions()}
              value={String(target.currentSuperimpositionLevel)}
              onChange={(value) => {
                if (value != null) updateTarget(form, index, { currentSuperimpositionLevel: Number(value) as SuperimpositionLevel })
              }}
            />
          </Flex>
        </Flex>

      </Flex>
    </Paper>
  )
}

function WarpEmptyTargetHeader(props: {
  rank: number,
  dragHandleRef?: (node: HTMLDivElement | null) => void,
  dragHandleProps?: HTMLAttributes<HTMLDivElement>,
}) {
  const { dragHandleProps, dragHandleRef, rank } = props

  return (
    <div
      ref={dragHandleRef}
      className={classes.targetEmptyHeader}
      {...dragHandleProps}
      aria-label={`Reorder target ${rank}`}
    >
      <span className={classes.targetEmptyRank}>{rank}</span>
      <IconGripVertical className={classes.targetEmptyGrip} size={16} aria-hidden='true' />
    </div>
  )
}

function WarpCharacterHeader(props: {
  target: WarpTarget,
  rank: number,
  onClick: () => void,
  dragHandleRef?: (node: HTMLDivElement | null) => void,
  dragHandleProps?: HTMLAttributes<HTMLDivElement>,
}) {
  const { t } = useTranslation('common')
  const { t: tGameData } = useTranslation('gameData', { keyPrefix: 'Characters' })
  const { dragHandleProps, dragHandleRef, target, rank, onClick } = props
  const characterId = target.characterId
  const characterConfig = characterId ? getCharacterConfig(characterId) : undefined
  const showcaseColor = characterConfig?.display.showcaseColor
  const signatureLightConeId = characterConfig?.defaultLightCone
  const longName = characterId ? tGameData(`${characterId}.LongName`) as string : ''
  const characterName = characterId ? longName.includes('(') ? longName : tGameData(`${characterId}.Name`) : t('Character_one')
  const targetParts = {
    eidolon: target.targetEidolonLevel === EidolonLevel.NONE ? null : target.targetEidolonLevel,
    superimposition: target.targetSuperimpositionLevel === SuperimpositionLevel.NONE ? null : target.targetSuperimpositionLevel,
  }

  const frameStyle: CSSProperties = {
    backgroundColor: showcaseColor ? oklchCharacterListColor(showcaseColor, true, DEFAULT_CONFIG) : undefined,
  }

  return (
    <div
      ref={dragHandleRef}
      className={`${characterClasses.root} ${classes.targetCharacterHeader}`}
      data-character-id={characterId ?? undefined}
      data-scrim-mode='frosted'
      style={defaultTargetCssVars}
      {...dragHandleProps}
      role='button'
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
    >
      <div className={characterClasses.frame} style={frameStyle}>
        {characterId && (
          <div className={characterClasses.portraitBg}>
            <img
              src={Assets.getCharacterPreviewById(characterId)}
              alt=''
              draggable={false}
              decoding='async'
              onLoad={showImageOnLoad}
              style={characterConfig?.display.gridPortraitOffset
                ? { marginTop: -(characterConfig.display.gridPortraitOffset ?? 0) }
                : undefined}
            />
          </div>
        )}

        <div className={characterClasses.scrim} data-scrim-mode='frosted' />
        {signatureLightConeId && <div className={characterClasses.lcStrip} />}

        <div className={characterClasses.inner}>
          <div className={characterClasses.rankGripSlot}>
            <span className={characterClasses.rank}>{rank}</span>
          </div>

          <div className={characterClasses.info} data-name-shadow='true'>
            <div className={characterClasses.name}>{characterName}</div>
            <div className={characterClasses.subtitle}>
              {targetParts.eidolon != null && (
                <span className={characterClasses.subtitleBadge}>{t('EidolonNShort', { eidolon: targetParts.eidolon })}</span>
              )}
              {targetParts.superimposition != null && (
                <span className={characterClasses.subtitleBadge}>{t('SuperimpositionNShort', { superimposition: targetParts.superimposition })}</span>
              )}
            </div>
          </div>

          {signatureLightConeId && (
            <div className={characterClasses.lcWrap} data-lc-style='shadow'>
              <img
                src={Assets.getLightConeIconById(signatureLightConeId)}
                alt=''
                draggable={false}
                decoding='async'
                onLoad={showImageOnLoad}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function WarpResultsTable(props: { targetResults: WarpTargetResult[], request: EnrichedWarpRequest }) {
  const { t } = useTranslation('warpCalculatorTab')
  const { t: tGameData } = useTranslation('gameData', { keyPrefix: 'Characters' })
  const { request, targetResults } = props
  const getTargetDisplayName = (target: WarpTarget, targetIndex: number) => {
    if (!target.characterId) return ''

    const longName = tGameData(`${target.characterId}.LongName`) as string
    return longName.includes('(') ? longName : tGameData(`${target.characterId}.Name`) as string
  }

  const targetGroups = targetResults
    .map((targetResult, targetIndex) => ({
      target: targetResult.target,
      targetIndex,
      targetName: getTargetDisplayName(targetResult.target, targetIndex),
      rows: Object.entries(targetResult.milestoneResults ?? {})
        .map(([label, result]) => ({ key: `${targetResult.target.id}-${label}`, label, warps: result.warps, wins: result.wins })),
    }))
    .filter((group) => group.rows.length > 0)

  if (targetGroups.length === 0) return null

  return (
    <Table className={classes.warpTable} mt={16} style={{ width: '100%' }}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th style={{ textAlign: 'center', width: 200 }}>{t('ColumnTitles.Goal')}</Table.Th>
          <Table.Th style={{ textAlign: 'center', width: 250 }}>
            <Flex justify='center' align='center' gap={5}>
              <Trans<'ColumnTitles.Chance', 'warpCalculatorTab'>
                t={t}
                i18nKey='ColumnTitles.Chance'
                values={{ ticketCount: localeNumberComma(request.warps) }}
              >
                Success chance with [[ticketCount]]
                <img style={{ height: 18 }} src={Assets.getPass()}/>
              </Trans>
            </Flex>
          </Table.Th>
          <Table.Th style={{ textAlign: 'center', width: 250 }}>
            <Flex justify='center' align='center' gap={5}>
              <Trans t={t} i18nKey='ColumnTitles.Average'>
                Average # of
                <img style={{ height: 18 }} src={Assets.getPass()}/>
                required
              </Trans>
            </Flex>
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {targetGroups.map((group, groupIndex) => (
          <Fragment key={group.target.id}>
            <Table.Tr className={classes.targetResultSeparator}>
              <Table.Td colSpan={3}>
                <Flex align='center' gap={8}>
                  {group.target.characterId && (
                    <img
                      className={classes.targetResultSeparatorIcon}
                      src={Assets.getCharacterAvatarById(group.target.characterId)}
                      alt=''
                      draggable={false}
                    />
                  )}
                  <span className={classes.targetResultSeparatorIndex}>{group.targetIndex + 1}</span>
                  {group.targetName && <span className={classes.targetResultSeparatorName}>{group.targetName}</span>}
                </Flex>
              </Table.Td>
            </Table.Tr>

            {group.rows.map((record) => (
              <Table.Tr
                key={record.key}
                className={record.wins < chanceThreshold ? classes.warpRowDisabled : classes.warpRow}
              >
                <Table.Td className={classes.goalCell}>
                  <Flex className={classes.goalBarOverlay} align='center'>
                    {record.wins >= chanceThreshold && (
                      <div
                        className={classes.goalBar}
                        style={{
                          width: `${record.wins * 100}%`,
                          backgroundColor: warpChanceColorScale(record.wins).hex(),
                        }}
                      />
                    )}
                    <Flex className={classes.goalContent} justify='center' align='center'>
                      <Badge color='#000000aa' className={classes.goalBadge} style={{ fontWeight: 'normal', fontSize: 12 }}>
                        {translateLabel(record.label)}
                      </Badge>
                    </Flex>
                  </Flex>
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                  {`${localeNumber_0(precisionRound(record.wins * 100, 1))}%`}
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                  <Flex align='center' justify='center' gap={HEADER_LABEL_GAP}>
                    {`${Math.ceil(record.warps)}`}
                    <img style={{ height: 16 }} src={Assets.getPass()}/>
                  </Flex>
                </Table.Td>
              </Table.Tr>
            ))}
          </Fragment>
        ))}
      </Table.Tbody>
    </Table>
  )
}

const chanceThreshold = 0.0005

function PityInputs(props: { banner: string, form: UseFormReturnType<WarpRequest> }) {
  const { t } = useTranslation(['warpCalculatorTab', 'common'])
  const { form } = props

  const pityField = `pity${props.banner}` as keyof WarpRequest
  const guaranteedField = `guaranteed${props.banner}` as keyof WarpRequest

  return (
    <Flex gap={20} w='100%'>
      <Flex direction="column" flex={1} gap={HEADER_LABEL_GAP}>
        <HeaderText>{t('PityCounter.PityCounter')/* Pity counter */}</HeaderText>

        <NumberInput
          placeholder='0' min={0} max={props.banner === 'Character' ? 89 : 79}
          style={{ width: '100%' }}
          hideControls
          {...form.getInputProps(pityField)}
        />
      </Flex>
      <Flex direction="column" flex={1} gap={HEADER_LABEL_GAP}>
        <HeaderText>{t('PityCounter.Guaranteed')/* Guaranteed */}</HeaderText>
        <SegmentedControl
          fullWidth
          data={[
            { label: <IconCheck size={18}/>, value: 'true' },
            { label: <IconX size={18}/>, value: 'false' },
          ]}
          value={String(form.getValues()[guaranteedField] ?? false)}
          onChange={(val) => form.setFieldValue(guaranteedField, (val === 'true') as never)}
        />
      </Flex>
    </Flex>
  )
}

function generateIncomeOptions() {
  const t = i18next.getFixedT(null, 'warpCalculatorTab', 'IncomeOptions')
  const types = [WarpIncomeType.F2P, WarpIncomeType.EXPRESS, WarpIncomeType.BP_EXPRESS]

  return types.map((type) => ({
    group: t(`Type.${type}`),
    items: WarpIncomeOptions
      .filter((option) => option.type === type)
      .map((option) => {
        const totalPhases = Math.max(...WarpIncomeOptions.filter((o) => o.type === type && o.version === option.version).map((o) => o.phase))
        const labelPrefix = t('Label', {
          versionNumber: option.version,
          phaseNumber: option.phase,
          totalPhases: totalPhases,
          type: t(`Type.${option.type}`),
        })
        return {
          value: option.id,
          label: `${labelPrefix} +${localeNumberComma(option.passes)}`,
        }
      }),
  }))
}

function generateStrategyOptions() {
  const t = i18next.getFixedT(null, 'warpCalculatorTab', 'StrategyLabels')
  return [
    { value: String(WarpStrategy.S1), label: t('S1')/* 'S1 first' */ },
    { value: String(WarpStrategy.E0), label: t('E0')/* 'E0 first' */ },
    { value: String(WarpStrategy.E1), label: t('E1')/* 'E1 first' */ },
    { value: String(WarpStrategy.E2), label: t('E2')/* 'E2 first' */ },
    { value: String(WarpStrategy.E3), label: t('E3')/* 'E3 first' */ },
    { value: String(WarpStrategy.E4), label: t('E4')/* 'E4 first' */ },
    { value: String(WarpStrategy.E5), label: t('E5')/* 'E5 first' */ },
    { value: String(WarpStrategy.E6), label: t('E6')/* 'E6 first' */ },
  ]
}

function generateStarlightOptions() {
  const t = i18next.getFixedT(null, 'warpCalculatorTab', 'RefundLabels')
  return Object.values(StarlightRefund).map((refund) => ({
    value: refund,
    label: t(`${refund}_FULL`, { Percentage: refundLabel(refund, refund === StarlightRefund.REFUND_AVG) }),
  }))
}

function refundLabel(starlight: StarlightRefund, showDecimal: boolean = false) {
  const value = StarlightMultiplier[starlight] * 100
  return showDecimal ? localeNumber_0(value) : localeNumber(value)
}

function generateEidolonLevelOptions() {
  const t = i18next.getFixedT(null, 'warpCalculatorTab', 'EidolonLevels')
  return [
    { value: String(EidolonLevel.NONE), label: t('NONE') },
    { value: String(EidolonLevel.E0), label: t('E0') },
    { value: String(EidolonLevel.E1), label: t('E1') },
    { value: String(EidolonLevel.E2), label: t('E2') },
    { value: String(EidolonLevel.E3), label: t('E3') },
    { value: String(EidolonLevel.E4), label: t('E4') },
    { value: String(EidolonLevel.E5), label: t('E5') },
    { value: String(EidolonLevel.E6), label: t('E6') },
  ]
}

function generateSuperimpositionLevelOptions() {
  const t = i18next.getFixedT(null, 'warpCalculatorTab', 'SuperimpositionLevels')
  return [
    { value: String(SuperimpositionLevel.NONE), label: t('NONE') },
    { value: String(SuperimpositionLevel.S1), label: t('S1') },
    { value: String(SuperimpositionLevel.S2), label: t('S2') },
    { value: String(SuperimpositionLevel.S3), label: t('S3') },
    { value: String(SuperimpositionLevel.S4), label: t('S4') },
    { value: String(SuperimpositionLevel.S5), label: t('S5') },
  ]
}

function translateLabel(label: string) {
  const t = i18next.getFixedT(null, ['warpCalculatorTab', 'common'])
  if (/^S\d$/.test(label)) return t('common:SuperimpositionNShort', { superimposition: label.charAt(1) })
  return t('warpCalculatorTab:TargetLabel', { superimposition: label.charAt(3), eidolon: label.charAt(1) })
}

function getCharacterSelectionPatch(characterId: WarpTarget['characterId']): Partial<WarpTarget> {
  if (!characterId) {
    return {
      characterId: null,
      currentEidolonLevel: EidolonLevel.NONE,
      currentSuperimpositionLevel: SuperimpositionLevel.NONE,
    }
  }

  const savedCharacter = getCharacterById(characterId)
  const signatureLightConeId = getDefaultLightConeId(characterId)

  return {
    characterId,
    currentEidolonLevel: coerceSavedEidolonLevel(savedCharacter?.form?.characterEidolon),
    currentSuperimpositionLevel: getOwnedSignatureSuperimposition(signatureLightConeId),
  }
}

function getOwnedSignatureSuperimposition(
  signatureLightConeId: LightConeId | null,
): SuperimpositionLevel {
  if (!signatureLightConeId) return SuperimpositionLevel.NONE

  const scannedSignatureLightCones = Object.values(useScannerState.getState().lightCones)
    .filter((lightCone) => lightCone.id === signatureLightConeId)
  if (scannedSignatureLightCones.length > 0) {
    return coerceSavedSuperimpositionLevel(Math.max(...scannedSignatureLightCones.map((lightCone) => lightCone.superimposition)))
  }

  const savedSignatureHolders = getCharacters()
    .filter((character) => character.form?.lightCone === signatureLightConeId)
  if (savedSignatureHolders.length > 0) {
    return coerceSavedSuperimpositionLevel(Math.max(...savedSignatureHolders.map((character) => character.form.lightConeSuperimposition)))
  }

  return SuperimpositionLevel.NONE
}

function getDefaultLightConeId(characterId: WarpTarget['characterId']): LightConeId | null {
  return characterId ? getCharacterConfig(characterId)?.defaultLightCone ?? null : null
}

function coerceSavedEidolonLevel(level: unknown): EidolonLevel {
  return typeof level === 'number' && level >= EidolonLevel.E0 && level <= EidolonLevel.E6
    ? level as EidolonLevel
    : EidolonLevel.NONE
}

function coerceSavedSuperimpositionLevel(level: unknown): SuperimpositionLevel {
  return typeof level === 'number' && level >= SuperimpositionLevel.S1 && level <= SuperimpositionLevel.S5
    ? level as SuperimpositionLevel
    : SuperimpositionLevel.NONE
}

function updateTarget(form: UseFormReturnType<WarpRequest>, index: number, patch: Partial<WarpTarget>) {
  const targets = form.getValues().targets.map((target, targetIndex) => {
    if (targetIndex !== index) return target
    return { ...target, ...patch }
  })
  form.setFieldValue('targets', targets)
}

function addTarget(form: UseFormReturnType<WarpRequest>) {
  const id = globalThis.crypto?.randomUUID?.() ?? `target-${Date.now()}`
  const targets = [
    ...form.getValues().targets,
    {
      ...DEFAULT_WARP_REQUEST.targets[0],
      id,
      strategy: form.getValues().strategy,
      targetEidolonLevel: EidolonLevel.E0,
      targetSuperimpositionLevel: SuperimpositionLevel.NONE,
    },
  ]
  form.setFieldValue('targets', targets)
}

function removeTarget(form: UseFormReturnType<WarpRequest>, index: number) {
  const targets = form.getValues().targets.filter((_, targetIndex) => targetIndex !== index)
  if (targets.length > 0) {
    form.setFieldValue('targets', targets)
  }
}

function moveTarget(form: UseFormReturnType<WarpRequest>, activeId: string, overId: string) {
  const targets = [...form.getValues().targets]
  const fromIndex = targets.findIndex((target) => target.id === activeId)
  const toIndex = targets.findIndex((target) => target.id === overId)

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return

  const [target] = targets.splice(fromIndex, 1)
  targets.splice(toIndex, 0, target)
  form.setFieldValue('targets', targets)
}
