import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { hp, wp } from "../../helpers/common";
import { useAuth } from "../../contexts/AuthContext";
import Input from "../../components/Input";
import Icon from "../../assets/icons";
import SearchItem from "../../components/SearchItem";
import { StatusBar } from "expo-status-bar";
import { getFeaturedUsers } from "../../services/userService";
import { theme } from "../../constants/theme";
import { useRouter } from "expo-router";
import { searchUsers } from "../../services/searchService";

const Search = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [results, setResults] = useState([]);

  const getSearchResults = async () => {
    if (!searchInput) {
      let res = await getFeaturedUsers();
      if (res.success) setResults(res.data);
    }
    if (searchInput) {
      let res = await searchUsers(searchInput);
      if (res.success) setResults(res.data);
    }
  };

  useEffect(() => {
    getSearchResults();
  }, [searchInput]);

  return (
    <ScreenWrapper>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Input
          icon={<Icon name="search" size={26} strokeWidth={1.6} />}
          placeholder="search..."
          onChangeText={(text) => setSearchInput(text)}
        />
        {results.length !== 0 &&<View style={{ display: "flex", marginTop: hp(2) }}>
          <Text
            style={{
              fontSize: hp(2),
              fontWeight: theme.fonts.semibold,
              color: theme.colors.text,
            }}
          >
            {searchInput ? 'Search Results' : 'Featured Accounts'}
          </Text>
        </View>}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
        >
          {results.map((item) => {
            return <SearchItem item={item} key={item?.id} router={router} />;
          })}
          {results.length == 0 && (
            <Text style={styles.noData}>No Search Results</Text>
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    marginTop: hp(2),
    flex: 1,
    paddingHorizontal: wp(4),
  },
  listStyle: {
    paddingVertical: 20,
    gap: 10,
  },
  noData: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    textAlign: "center",
  },
});
