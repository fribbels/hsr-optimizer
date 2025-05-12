import { Modal, Typography, Flex } from 'antd';
import { useTranslation } from 'react-i18next';
import { V4ParserRelic } from 'lib/importer/kelzFormatParser';
import { ReliquaryArchiverParser } from 'lib/importer/importConfig';
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview';
import { RelicScorer } from 'lib/relics/relicScorerPotential';
import { DoubleRightOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface RelicRerollModalProps {
  open: boolean;
  onClose: () => void;
  relic: V4ParserRelic;
}

export default function RelicRerollModal({ open, onClose, relic }: RelicRerollModalProps) {
  const { t } = useTranslation(['modals', 'common', 'gameData']);

  if (!relic || !relic.reroll_substats) {
    return null;
  }

  const originalRelic = ReliquaryArchiverParser.parseRelic(relic, relic.substats)
  const rerolledRelic = ReliquaryArchiverParser.parseRelic(relic, relic.reroll_substats)
  if (!originalRelic || !rerolledRelic) {
    return null;
  }

  return (
    <Modal
      title={t('modals:RelicReroll.Title')/* Relic Reroll Detected */}
      open={open}
      onOk={onClose}
      cancelButtonProps={{ style: { display: 'none' } }}
      centered
      width={540}
    >
      <Flex vertical gap={16}>
        <Flex gap={16} justify="space-between">
          <Flex vertical align="center" gap={4}>
            <RelicPreview 
              relic={originalRelic} 
              score={originalRelic.equippedBy ? RelicScorer.scoreCurrentRelic(originalRelic, originalRelic.equippedBy) : undefined}
              unhoverable 
            />
            <Text strong>{t('modals:RelicReroll.OriginalSubstats')/* Original Substats */}</Text>
          </Flex>

          <DoubleRightOutlined style={{ fontSize: "24px" }}/>
          
          <Flex vertical align="center" gap={4}>
            <RelicPreview 
              relic={rerolledRelic} 
              score={rerolledRelic.equippedBy ? RelicScorer.scoreCurrentRelic(rerolledRelic, rerolledRelic.equippedBy) : undefined}
              unhoverable 
            />
            <Text strong>{t('modals:RelicReroll.RerolledSubstats')/* Rerolled Substats */}</Text>
          </Flex>
        </Flex>
      </Flex>
    </Modal>
  );
} 