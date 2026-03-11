import { IconRefresh } from '@tabler/icons-react'
import { Button, Flex, Select } from '@mantine/core'
import { showcaseOutlineLight } from 'lib/characterPreview/CharacterPreviewComponents'
import { Message } from 'lib/interactions/message'
import { Assets } from 'lib/rendering/assets'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { CharacterConditionalsDisplay } from 'lib/tabs/tabOptimizer/conditionals/CharacterConditionalsDisplay'
import { LightConeConditionalDisplay } from 'lib/tabs/tabOptimizer/conditionals/LightConeConditionalDisplay'
import CharacterSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelect'
import LightConeSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/LightConeSelect'
import FormCard from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import {
  cardHeight,
  lcInnerH,
  lcInnerW,
  lcParentH,
  lcParentW,
  lcWidth,
  parentH,
  parentW,
  renderTeammateOrnamentSetOptions,
  renderTeammateRelicSetOptions,
  rightPanelWidth,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/teammate/teammateCardUtils'
import { updateTeammate } from 'lib/tabs/tabOptimizer/optimizerForm/components/teammate/updateTeammate'
import React, {
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import {
  CharacterId,
} from 'types/character'
import {
  TeammateProperty,
} from 'types/form'
import {
  LightConeId,
  SuperImpositionLevel,
} from 'types/lightCone'
import { DBMetadata } from 'types/metadata'
import classes from './TeammateCard.module.css'

// Re-export public symbols for backward compatibility
export {
  optionRenderer,
  labelRender,
  renderTeammateRelicSetOptions,
  renderTeammateOrnamentSetOptions,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/teammate/teammateCardUtils'
export type { OptionRender } from 'lib/tabs/tabOptimizer/optimizerForm/components/teammate/teammateCardUtils'
export { updateTeammate } from 'lib/tabs/tabOptimizer/optimizerForm/components/teammate/updateTeammate'

const TeammateCard = React.memo(function TeammateCard(props: {
  index: number
  dbMetadata: DBMetadata
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'TeammateCard' })
  const tmIndex = props.index as 0 | 1 | 2
  const {
    teammateCharacterId,
    teammateEidolon,
    teammateLightConeId,
    teammateSuperimposition,
    teammateTeamRelicSet,
    teammateTeamOrnamentSet,
  } = useOptimizerRequestStore(
    useShallow((s) => ({
      teammateCharacterId: s.teammates[tmIndex].characterId as CharacterId,
      teammateEidolon: s.teammates[tmIndex].characterEidolon,
      teammateLightConeId: s.teammates[tmIndex].lightCone as LightConeId,
      teammateSuperimposition: s.teammates[tmIndex].lightConeSuperimposition as SuperImpositionLevel,
      teammateTeamRelicSet: s.teammates[tmIndex].teamRelicSet,
      teammateTeamOrnamentSet: s.teammates[tmIndex].teamOrnamentSet,
    })),
  )

  const [teammateSelectModalOpen, setTeammateSelectModalOpen] = useState(false)

  const [teammateLightConeSelectOpen, setTeammateLightConeSelectOpen] = useState(false)

  const disabled = teammateCharacterId == null

  const teammateRelicSetOptions = useMemo(renderTeammateRelicSetOptions(t), [t])
  const teammateOrnamentSetOptions = useMemo(renderTeammateOrnamentSetOptions(t), [t])

  const superimpositionOptions = useMemo(() => {
    const options: {
      value: number
      label: string
    }[] = []
    for (let i = 1; i <= 5; i++) {
      options.push({ value: i, label: t('SuperimpositionN', { superimposition: i }) })
    }
    return options
  }, [t])

  const eidolonOptions = useMemo(() => {
    const options: {
      value: number
      label: string
    }[] = []
    for (let i = 0; i <= 6; i++) {
      options.push({ value: i, label: t('EidolonN', { eidolon: i }) })
    }
    return options
  }, [t])

  const eidolonSelectData = useMemo(() => eidolonOptions.map((opt) => ({ value: String(opt.value), label: opt.label })), [eidolonOptions])
  const superimpositionSelectData = useMemo(() => superimpositionOptions.map((opt) => ({ value: String(opt.value), label: opt.label })), [superimpositionOptions])
  const teammateRelicSelectData = useMemo(() => teammateRelicSetOptions.map((opt) => ({ value: opt.value, label: opt.desc })), [teammateRelicSetOptions])
  const teammateOrnamentSelectData = useMemo(() => teammateOrnamentSetOptions.map((opt) => ({ value: opt.value, label: opt.desc })), [teammateOrnamentSetOptions])

  return (
    <FormCard size='medium' height={cardHeight} style={{ overflow: 'auto' }}>
      <Flex direction="column" gap={5}>
        <Flex gap={5}>
          <CharacterSelect
            value={teammateCharacterId}
            onChange={(id) => {
              if (id) {
                useOptimizerRequestStore.getState().setTeammateField(tmIndex, 'characterId', id)
                updateTeammate({ [`teammate${props.index}` as TeammateProperty]: { characterId: id } })
              } else {
                updateTeammate({ [`teammate${props.index}` as TeammateProperty]: { characterId: null } })
              }
            }}
            selectStyle={{}}
            externalOpen={teammateSelectModalOpen}
            setExternalOpen={setTeammateSelectModalOpen}
          />

          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            className={classes.refreshButton}
            disabled={disabled}
            onClick={() => {
              updateTeammate({ [`teammate${props.index}` as TeammateProperty]: { characterId: teammateCharacterId } })
              Message.success(t('TeammateSyncSuccessMessage'))
            }}
          />

          <Select
            searchable
            className={classes.setSelect}
            data={eidolonSelectData}
            value={teammateEidolon != null ? String(teammateEidolon) : null}
            onChange={(val) => { if (val != null) useOptimizerRequestStore.getState().setTeammateField(tmIndex, 'characterEidolon', Number(val)) }}
            placeholder={t('EidolonPlaceholder')}
            disabled={disabled}
          />
        </Flex>

        <Flex>
          <Flex direction="column" className={classes.conditionalsColumn}>
            <CharacterConditionalsDisplay
              id={teammateCharacterId}
              eidolon={teammateEidolon}
              teammateIndex={props.index}
            />
          </Flex>
          <Flex direction="column" gap={5}>
            <div
              className={classes.avatarContainer}
              style={{
                width: `${rightPanelWidth}px`,
                height: `${rightPanelWidth}px`,
                borderRadius: rightPanelWidth,
                border: teammateCharacterId ? showcaseOutlineLight : undefined,
              }}
            >
              <img
                width={rightPanelWidth}
                height={rightPanelWidth}
                src={Assets.getCharacterAvatarById(teammateCharacterId)}
                onClick={() => setTeammateSelectModalOpen(true)}
                className={classes.avatarImage}
              />
            </div>

            <Select
              className={`teammate-set-select ${classes.setSelect}`}
              data={teammateRelicSelectData}
              value={teammateTeamRelicSet}
              onChange={(val) => useOptimizerRequestStore.getState().setTeammateField(tmIndex, 'teamRelicSet', val ?? undefined)}
              placeholder={t('RelicsPlaceholder')}
              clearable
              comboboxProps={{ width: 'auto' }}
              disabled={disabled}
            />

            <Select
              className={`teammate-set-select ${classes.setSelect}`}
              data={teammateOrnamentSelectData}
              value={teammateTeamOrnamentSet}
              onChange={(val) => useOptimizerRequestStore.getState().setTeammateField(tmIndex, 'teamOrnamentSet', val ?? undefined)}
              placeholder={t('OrnamentsPlaceholder')}
              clearable
              comboboxProps={{ width: 'auto' }}
              disabled={disabled}
            />
          </Flex>
        </Flex>

        <Flex gap={5}>
          <LightConeSelect
            value={teammateLightConeId ?? null}
            onChange={(id) => {
              if (id) {
                useOptimizerRequestStore.getState().setTeammateField(tmIndex, 'lightCone', id)
                updateTeammate({ [`teammate${props.index}` as TeammateProperty]: { lightCone: id } })
              } else {
                updateTeammate({ [`teammate${props.index}` as TeammateProperty]: { lightCone: null } })
              }
            }}
            selectStyle={{ width: 258 }}
            characterId={teammateCharacterId}
            externalOpen={teammateLightConeSelectOpen}
            setExternalOpen={setTeammateLightConeSelectOpen}
          />

          <Select
            searchable
            className={classes.setSelect}
            data={superimpositionSelectData}
            value={teammateSuperimposition != null ? String(teammateSuperimposition) : null}
            onChange={(val) => { if (val != null) useOptimizerRequestStore.getState().setTeammateField(tmIndex, 'lightConeSuperimposition', Number(val)) }}
            placeholder={t('SuperimpositionPlaceholder')}
            disabled={disabled}
          />
        </Flex>

        <Flex>
          <Flex direction="column" className={classes.conditionalsColumn}>
            <LightConeConditionalDisplay
              id={teammateLightConeId}
              superImposition={teammateSuperimposition}
              teammateIndex={props.index}
              dbMetadata={props.dbMetadata}
            />
          </Flex>
          <Flex>
            <div className={classes.lcContainer} style={{ width: `${parentW}px`, height: `${parentH}px` }}>
              <img
                width={lcWidth}
                src={Assets.getLightConeIconById(teammateLightConeId)}
                className={classes.lcImage}
                style={{
                  transform: `translate(${(lcInnerW - lcParentW) / 2 / lcInnerW * -100}%, ${(lcInnerH - lcParentH) / 2 / lcInnerH * -100}%)`,
                }}
                onClick={() => setTeammateLightConeSelectOpen(true)}
              />
            </div>
          </Flex>
        </Flex>
      </Flex>
    </FormCard>
  )
})

export default TeammateCard
